export interface WHODASFeedback {
  id?: number;
  understanding_and_communicating?: number;
  getting_around?: number;
  self_care?: number;
  getting_along_with_people?: number;
  life_activities?: number;
  participation_in_society?: number;
  created_at?: string;
  updated_at?: string;
  feedback_id?: number;
  unable_days?: number;
  overall_score?: number;
  difficulty_days?: number;
  health_condition_days?: number;
  [key: string]: any; // For camelCase variants
}

export interface WHODASRecord {
  feedback_id?: number;
  session_id?: number;
  session_dte?: string;
  form_id?: number;
  form_cde?: string;
  client_id?: number;
  feedback_json?: any;
  status_yn?: string;
  feedback_whodas?: WHODASFeedback[];
  created_at?: string;
  updated_at?: string;
  tenant_id?: number;
}

export interface WHODASDomainChartProps {
  whodasData: WHODASRecord[];
  loading: boolean;
}

export interface DomainMapping {
  key: string;
  label: string;
}

export interface DataPoint {
  value: number;
}

export interface SeriesItem {
  name: string;
  type: string;
  data: DataPoint[];
  itemStyle: { color: string };
  label: {
    show: boolean;
    position: string;
    fontSize: number;
    color: string;
    formatter: (params: any) => string;
  };
  markLine?: {
    silent: boolean;
    lineStyle: {
      type: string;
      color: string;
    };
    data: Array<{
      yAxis: number;
      name: string;
      label: {
        show: boolean;
        position?: string;
        formatter?: string;
      };
    }>;
  };
}
