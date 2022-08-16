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