// Constants for Coverage Plot Form

export const CARRIERS = {
    AT_T: 'AT&T',
    VERIZON: 'Verizon',
    T_MOBILE: 'T-Mobile'
}

export const COVERAGE_TYPES = {
    INDOOR: 'Indoor',
    OUTDOOR: 'Outdoor',
    INDOOR_OUTDOOR: 'Indoor & Outdoor'
}

export const VALIDATION_MESSAGES = {
    ADDRESS_REQUIRED: 'Please enter an address',
    CARRIER_REQUIRED: 'Please select at least one carrier',
    COVERAGE_TYPE_REQUIRED: 'Please select at least one coverage type'
}

export const ANIMATION_DURATIONS = {
    PROGRESS_BAR: 500, // ms
    STEP_FADE: 300, // ms
    STEP_FADE_HALF: 150 // ms - half of fade duration for text change
}

export const DEFAULT_COORDINATES = {
    lat: 40.7128,
    lng: -74.0060
}

export const DEFAULT_ZOOM = 13
