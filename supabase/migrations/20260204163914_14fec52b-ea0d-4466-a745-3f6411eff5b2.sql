-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum types for data classification
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.alert_type AS ENUM ('tree_loss', 'heat_spike', 'risk_alert', 'plantation_needed', 'vegetation_change');
CREATE TYPE public.land_type AS ENUM ('residential', 'commercial', 'industrial', 'mixed_urban', 'green_zone', 'water_body');

-- Wards table with spatial boundaries
CREATE TABLE public.wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_number INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    area_sq_km DECIMAL(10,2) NOT NULL,
    population INTEGER,
    boundary GEOMETRY(Polygon, 4326),
    centroid GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NDVI (Vegetation Health) scores - time series data
CREATE TABLE public.ndvi_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
    observation_date DATE NOT NULL,
    ndvi_value DECIMAL(5,4) NOT NULL CHECK (ndvi_value >= -1 AND ndvi_value <= 1),
    evi_value DECIMAL(5,4) CHECK (evi_value >= -1 AND evi_value <= 1),
    green_cover_percent DECIMAL(5,2) NOT NULL CHECK (green_cover_percent >= 0 AND green_cover_percent <= 100),
    vegetation_density TEXT,
    satellite_source TEXT DEFAULT 'Sentinel-2',
    confidence_score DECIMAL(5,2) DEFAULT 85.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ward_id, observation_date)
);

-- Heat stress indices - time series data
CREATE TABLE public.heat_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
    observation_date DATE NOT NULL,
    land_surface_temp DECIMAL(5,2) NOT NULL,
    ambient_temp DECIMAL(5,2),
    humidity DECIMAL(5,2),
    heat_index INTEGER NOT NULL CHECK (heat_index >= 0 AND heat_index <= 100),
    uhi_intensity DECIMAL(5,2),
    thermal_comfort_index DECIMAL(5,2),
    data_source TEXT DEFAULT 'MODIS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ward_id, observation_date)
);

-- Risk assessments combining multiple factors
CREATE TABLE public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
    assessment_date DATE NOT NULL,
    overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
    heat_risk_score INTEGER CHECK (heat_risk_score >= 0 AND heat_risk_score <= 100),
    vegetation_risk_score INTEGER CHECK (vegetation_risk_score >= 0 AND vegetation_risk_score <= 100),
    priority priority_level NOT NULL,
    risk_factors JSONB DEFAULT '{}',
    ai_analysis TEXT,
    confidence_score DECIMAL(5,2) DEFAULT 90.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ward_id, assessment_date)
);

-- Alerts for tree loss, heat spikes, etc.
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
    alert_type alert_type NOT NULL,
    severity priority_level NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    location GEOMETRY(Point, 4326),
    location_description TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    detection_method TEXT DEFAULT 'AI',
    confidence_score DECIMAL(5,2) DEFAULT 85.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plantation plans and recommendations
CREATE TABLE public.plantation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
    plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
    required_trees INTEGER NOT NULL,
    recommended_species JSONB DEFAULT '[]',
    land_type land_type NOT NULL,
    estimated_heat_reduction DECIMAL(4,2),
    estimated_co2_offset DECIMAL(10,2),
    estimated_cost_inr DECIMAL(12,2),
    implementation_timeline TEXT,
    ai_reasoning TEXT,
    ai_confidence DECIMAL(5,2) DEFAULT 90.0,
    status TEXT DEFAULT 'proposed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CO2 absorption tracking
CREATE TABLE public.co2_absorption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
    observation_date DATE NOT NULL,
    absorption_tons DECIMAL(10,2) NOT NULL,
    tree_count_estimate INTEGER,
    carbon_density DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ward_id, observation_date)
);

-- Climate data from external sources
CREATE TABLE public.climate_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE,
    observation_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature DECIMAL(5,2),
    feels_like DECIMAL(5,2),
    humidity DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    air_quality_index INTEGER,
    pm25 DECIMAL(6,2),
    pm10 DECIMAL(6,2),
    uv_index DECIMAL(4,2),
    precipitation_mm DECIMAL(6,2),
    data_source TEXT DEFAULT 'OpenWeather',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics for dashboard
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit TEXT,
    observation_date DATE NOT NULL,
    trend_direction TEXT,
    trend_value DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_name, observation_date)
);

-- Enable RLS on all tables
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heat_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co2_absorption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for all data (read-only public dashboard)
CREATE POLICY "Public read access for wards" ON public.wards FOR SELECT USING (true);
CREATE POLICY "Public read access for ndvi_scores" ON public.ndvi_scores FOR SELECT USING (true);
CREATE POLICY "Public read access for heat_indices" ON public.heat_indices FOR SELECT USING (true);
CREATE POLICY "Public read access for risk_assessments" ON public.risk_assessments FOR SELECT USING (true);
CREATE POLICY "Public read access for alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public read access for plantation_plans" ON public.plantation_plans FOR SELECT USING (true);
CREATE POLICY "Public read access for co2_absorption" ON public.co2_absorption FOR SELECT USING (true);
CREATE POLICY "Public read access for climate_data" ON public.climate_data FOR SELECT USING (true);
CREATE POLICY "Public read access for system_metrics" ON public.system_metrics FOR SELECT USING (true);

-- Create spatial indices
CREATE INDEX idx_wards_boundary ON public.wards USING GIST (boundary);
CREATE INDEX idx_wards_centroid ON public.wards USING GIST (centroid);
CREATE INDEX idx_alerts_location ON public.alerts USING GIST (location);

-- Create time-based indices for efficient queries
CREATE INDEX idx_ndvi_ward_date ON public.ndvi_scores (ward_id, observation_date DESC);
CREATE INDEX idx_heat_ward_date ON public.heat_indices (ward_id, observation_date DESC);
CREATE INDEX idx_risk_ward_date ON public.risk_assessments (ward_id, assessment_date DESC);
CREATE INDEX idx_alerts_detected ON public.alerts (detected_at DESC);
CREATE INDEX idx_alerts_active ON public.alerts (is_active, severity);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON public.wards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plantation_plans_updated_at BEFORE UPDATE ON public.plantation_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();