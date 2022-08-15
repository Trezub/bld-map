// To parse this data:
//
//   import { Convert } from "./file";
//
//   const route = Convert.toRoute(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Route {
    routeId:            number;
    totalDuration:      string;
    stops:              Stop[];
    legs:               Leg[];
    distributionCenter: DistributionCenter;
}

export interface DistributionCenter {
    address: DistributionCenterAddress;
}

export interface DistributionCenterAddress {
    latitude:  number;
    longitude: number;
}

export interface Leg {
    distance:          Distance;
    duration:          Distance;
    endAddress:        string;
    endLocation:       Location;
    startAddress:      string;
    startLocation:     Location;
    steps:             Step[];
    trafficSpeedEntry: any[];
    viaWaypoint:       any[];
}

export interface Distance {
    text:  string;
    value: number;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Step {
    distance:         Distance;
    duration:         Distance;
    endLocation:      Location;
    htmlInstructions: string;
    polyline:         Polyline;
    startLocation:    Location;
    travelMode:       TravelMode;
    maneuver?:        Maneuver;
}

export enum Maneuver {
    KeepRight = "keep-right",
    Merge = "merge",
    RampLeft = "ramp-left",
    RampRight = "ramp-right",
    RoundaboutRight = "roundabout-right",
    Straight = "straight",
    TurnLeft = "turn-left",
    TurnRight = "turn-right",
    TurnSharpLeft = "turn-sharp-left",
    TurnSharpRight = "turn-sharp-right",
    TurnSlightLeft = "turn-slight-left",
    TurnSlightRight = "turn-slight-right",
    UturnLeft = "uturn-left",
}

export interface Polyline {
    points: string;
}

export enum TravelMode {
    Driving = "DRIVING",
}

export interface Stop {
    address:           StopAddress;
    stopTypeId?:       number;
    packagesQuantity?: number;
    date?:             string;
    hour?:             string;
    recipientName?:    string;
    packages?:         Package[];
}

export interface StopAddress {
    latitude:    number;
    longitude:   number;
    street?:     string;
    number?:     string;
    complement?: string;
    district?:   string;
    cityId?:     number;
    postalCode?: string;
}

export interface Package {
    id:      number;
    codeBar: string;
    volume:  number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toRoute(json: string): Route[] {
        return cast(JSON.parse(json), a(r("Route")));
    }

    public static routeToJson(value: Route[]): string {
        return JSON.stringify(uncast(value, a(r("Route"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = val[key];
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Route": o([
        { json: "routeId", js: "routeId", typ: 0 },
        { json: "totalDuration", js: "totalDuration", typ: "" },
        { json: "stops", js: "stops", typ: a(r("Stop")) },
        { json: "legs", js: "legs", typ: a(r("Leg")) },
        { json: "distributionCenter", js: "distributionCenter", typ: r("DistributionCenter") },
    ], false),
    "DistributionCenter": o([
        { json: "address", js: "address", typ: r("DistributionCenterAddress") },
    ], false),
    "DistributionCenterAddress": o([
        { json: "latitude", js: "latitude", typ: 3.14 },
        { json: "longitude", js: "longitude", typ: 3.14 },
    ], false),
    "Leg": o([
        { json: "distance", js: "distance", typ: r("Distance") },
        { json: "duration", js: "duration", typ: r("Distance") },
        { json: "end_address", js: "endAddress", typ: "" },
        { json: "end_location", js: "endLocation", typ: r("Location") },
        { json: "start_address", js: "startAddress", typ: "" },
        { json: "start_location", js: "startLocation", typ: r("Location") },
        { json: "steps", js: "steps", typ: a(r("Step")) },
        { json: "traffic_speed_entry", js: "trafficSpeedEntry", typ: a("any") },
        { json: "via_waypoint", js: "viaWaypoint", typ: a("any") },
    ], false),
    "Distance": o([
        { json: "text", js: "text", typ: "" },
        { json: "value", js: "value", typ: 0 },
    ], false),
    "Location": o([
        { json: "lat", js: "lat", typ: 3.14 },
        { json: "lng", js: "lng", typ: 3.14 },
    ], false),
    "Step": o([
        { json: "distance", js: "distance", typ: r("Distance") },
        { json: "duration", js: "duration", typ: r("Distance") },
        { json: "end_location", js: "endLocation", typ: r("Location") },
        { json: "html_instructions", js: "htmlInstructions", typ: "" },
        { json: "polyline", js: "polyline", typ: r("Polyline") },
        { json: "start_location", js: "startLocation", typ: r("Location") },
        { json: "travel_mode", js: "travelMode", typ: r("TravelMode") },
        { json: "maneuver", js: "maneuver", typ: u(undefined, r("Maneuver")) },
    ], false),
    "Polyline": o([
        { json: "points", js: "points", typ: "" },
    ], false),
    "Stop": o([
        { json: "address", js: "address", typ: r("StopAddress") },
        { json: "stopTypeId", js: "stopTypeId", typ: u(undefined, 0) },
        { json: "packagesQuantity", js: "packagesQuantity", typ: u(undefined, 0) },
        { json: "date", js: "date", typ: u(undefined, "") },
        { json: "hour", js: "hour", typ: u(undefined, "") },
        { json: "recipientName", js: "recipientName", typ: u(undefined, "") },
        { json: "packages", js: "packages", typ: u(undefined, a(r("Package"))) },
    ], false),
    "StopAddress": o([
        { json: "latitude", js: "latitude", typ: 3.14 },
        { json: "longitude", js: "longitude", typ: 3.14 },
        { json: "street", js: "street", typ: u(undefined, "") },
        { json: "number", js: "number", typ: u(undefined, "") },
        { json: "complement", js: "complement", typ: u(undefined, "") },
        { json: "district", js: "district", typ: u(undefined, "") },
        { json: "cityId", js: "cityId", typ: u(undefined, 0) },
        { json: "postalCode", js: "postalCode", typ: u(undefined, "") },
    ], false),
    "Package": o([
        { json: "id", js: "id", typ: 0 },
        { json: "codeBar", js: "codeBar", typ: "" },
        { json: "volume", js: "volume", typ: 0 },
    ], false),
    "Maneuver": [
        "keep-right",
        "merge",
        "ramp-left",
        "ramp-right",
        "roundabout-right",
        "straight",
        "turn-left",
        "turn-right",
        "turn-sharp-left",
        "turn-sharp-right",
        "turn-slight-left",
        "turn-slight-right",
        "uturn-left",
    ],
    "TravelMode": [
        "DRIVING",
    ],
};
