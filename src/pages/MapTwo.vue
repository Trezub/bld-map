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

async function handleAddInput() {
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

function saveInput(inputName: string) {
    const routes = routesValues.options.filter((route) => route.inputName === inputName);
    const json = JSON.stringify(routes, null, 4);
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = inputName;
    link.click();
    URL.revokeObjectURL(link.href);
}

const modal = reactive({ show: false });

</script>

<template>
    <section>
        <VueElementLoading :active="isLoading" spinner="spinner" color="#FF6700" is-full-screen />

        <vue-final-modal v-model="modal.show" @cancel="modal.show = false">
            <div id="modal">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Salvar entrada</h5>
                    <button type="button" class="btn" @click="modal.show = false">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p @click="saveInput(inputName)" v-for="inputName in new Set(routesValues.options.map(({ inputName }) => inputName))">{{
                            inputName
                    }} - {{routesValues.options.filter((option) => inputName === option.inputName).length}} rotas</p>
                </div>
            </div>
        </vue-final-modal>

        <div class="d-flex">
            <Multiselect v-model="routesValues.value" @select="handleChange" @deselect="handleChange" mode="tags"
                :close-on-select="false" :searchable="false" :create-option="false" :options="routesValues.options"
                value-prop="label" label="label" :object="true" @clear="handleClearRoutes" />
            <input class="btn" type="button" @click="handleAddInput" value="Adicionar entrada" />
            <input class="btn" v-if="routesValues.options.length > 0" type="button" @click="modal.show = true"
                value="Salvar entrada">
        </div>

        <GoogleMap ref="mapRef" :api-key="googleApiKey" style="width: 100%; height: calc(100vh - 40px)" :center="center" :zoom="12"
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
<style scoped>
#modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%);
    width: 500px;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
}

.modal-body > p {
    margin: 5px;
    background-color: #ddd;
    border-radius: 7px;
    padding: 10px;
    text-align: center;
    transition: all .1s ease-in-out;
    user-select: none;
}
.modal-body > p:hover {
    background-color: #ccc;
}
.modal-body > p:active {
    background-color: #bbb;
}
</style>
