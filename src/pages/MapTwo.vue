<script setup lang="ts">
import { GoogleMap, Marker, Polyline } from 'vue3-google-map';
import { generateRandomColor } from '../utils/generateRandomColor';
import VueElementLoading from 'vue-element-loading';
import { reactive, ref, watch } from 'vue';
import Multiselect from '@vueform/multiselect';
import { Route } from '../types/Routes.types';
import { faker } from '@faker-js/faker';
import { useToast } from 'vue-toast-notification';

const toast = useToast({ duration: 5000, dismissible: true });

const center = {
    lat: -25.43578524053438,
    lng: -49.256734002415286,
};

const googleApiKey = import.meta.env.VITE_GOOGLE_API_MAPS as string;

type Libraries = (
    | 'drawing'
    | 'geometry'
    | 'localContext'
    | 'places'
    | 'visualization'
)[];

const libraries: Libraries = [
    'geometry', // Usado para fazer decode dos polylines
];

type ImportedRoute = Route & {
    color: string;
    label: string;
    inputName: string;
}

const isLoading = ref(false);
const mapRef = ref<typeof GoogleMap>();

const routesValues = reactive({
    value: [] as { label: string }[],
    options: [] as ImportedRoute[],
});

const filteredRoutes = reactive({
    data: [] as ImportedRoute[],
});

watch(
    () => mapRef.value?.ready,
    (ready) => {
        isLoading.value = !ready;
    }
);

async function handleChange() {
    filteredRoutes.data = routesValues.options.filter(({ label }) =>
        routesValues.value.some((route) => route.label === label)
    );
}

function handleClearRoutes() {
    filteredRoutes.data = [];
}

async function handleAddInput(event: Event) {
    faker.setLocale('pt_BR');
    const label = `${faker.hacker.adjective()}-${faker.animal.type()}`.replace(' ', '-');

    const content = await navigator.clipboard.readText();
    if (!content) {
        return toast.error('Não foi possível ler o conteúdo do clipboard');
    }
    try {
        const newRoutes = JSON
            .parse(content)
            .map(
                (route: Route) => (
                    {
                        ...route,
                        color: generateRandomColor(),
                        label: `${label} - ${route.routeId}`,
                        inputName: label,
                    }
                )
            ) as ImportedRoute[];
        routesValues.options = [...routesValues.options, ...newRoutes];
        toast.info(`${newRoutes.length} rotas adicionadas como '${label}'`);
    } catch (err) {
        console.error(err);
        toast.error('Falha ao processar dados da entrada. Verifique o formato do conteúdo.\nMais detalhes no console');
    }
}

</script>

<template>
    <section class="flex-container rounded bg-white shadow m-3">
        <VueElementLoading :active="isLoading" spinner="spinner" color="#FF6700" is-full-screen />

        <div class="d-flex">
            <Multiselect v-model="routesValues.value" @select="handleChange" @deselect="handleChange" mode="tags"
                :close-on-select="false" :searchable="false" :create-option="false" :options="routesValues.options"
                value-prop="label" label="label" :object="true" @clear="handleClearRoutes" />
            <input type="button" @click="handleAddInput" value="Adicionar entrada" />
        </div>

        <GoogleMap ref="mapRef" :api-key="googleApiKey" style="width: 100%; height: 100vh" :center="center" :zoom="12"
            :libraries="libraries">
            <template #default="{ ready, api }">
                <template v-if="ready" v-for="route in filteredRoutes.data" :key="route.routeId">
                    <Marker :key="index" v-for="(stop, index) in route.stops" :options="{
                        position: {
                            lat: stop.address.latitude,
                            lng: stop.address.longitude,
                        },
                        icon: {
                            url: 'marker.svg',
                            strokeColor: route.color,
                        }
                    }" />

                    <template v-for="leg in route.legs">
                        <Polyline v-for="step in leg.steps" :key="step.polyline.points" :options="{
                            path: api.geometry.encoding.decodePath(step.polyline.points),
                            geodesic: true,
                            strokeColor: route.color,
                            strokeOpacity: .7,
                            strokeWeight: 4,
                        }" />
                    </template>
                </template>
            </template>
        </GoogleMap>
    </section>
</template>

<style src="@vueform/multiselect/themes/default.css">
</style>
