export interface Branch {
  id: string;
  name: string;
  address: string;
  contact: string;
  coordinates: [number, number];
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  branchId: string;
  coordinates: [number, number];
}

export interface MapState {
  branches: Branch[];
  representatives: Representative[];
  selectedMarker: Branch | Representative | null;
  isDrawingMode: boolean;
}

export interface MapAction {
  type: string;
  payload: any;
}
