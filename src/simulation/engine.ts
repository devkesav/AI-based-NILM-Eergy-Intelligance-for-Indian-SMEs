export type MachineState = 'OFF' | 'STARTING' | 'RUNNING' | 'IDLE' | 'ABNORMAL';

export interface MachineConfig {
  id: string;
  name: string;
  powerConfig: {
    OFF: number;
    STARTING: [number, number];
    RUNNING: [number, number];
    IDLE: [number, number];
    ABNORMAL: [number, number];
  };
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  baselineEnergyPerHour: number;
}

export const MACHINES: MachineConfig[] = [
  {
    id: 'motor_1',
    name: 'Induction Motor',
    powerConfig: {
      OFF: 0,
      STARTING: [7.0, 9.0],
      RUNNING: [3.0, 5.0],
      IDLE: [0.5, 1.0],
      ABNORMAL: [8.0, 10.0]
    },
    criticality: 'HIGH',
    baselineEnergyPerHour: 4.0
  },
  {
    id: 'pump_1',
    name: 'Pump',
    powerConfig: {
      OFF: 0,
      STARTING: [4.0, 4.5],
      RUNNING: [2.0, 2.5],
      IDLE: [0.3, 0.5],
      ABNORMAL: [3.5, 4.0]
    },
    criticality: 'MEDIUM',
    baselineEnergyPerHour: 2.2
  },
  {
    id: 'compressor_1',
    name: 'Air Compressor',
    powerConfig: {
      OFF: 0,
      STARTING: [9.0, 10.0],
      RUNNING: [5.0, 6.0],
      IDLE: [1.0, 2.0],
      ABNORMAL: [7.0, 8.5]
    },
    criticality: 'HIGH',
    baselineEnergyPerHour: 5.5
  },
  {
    id: 'cnc_1',
    name: 'CNC Machine',
    powerConfig: {
      OFF: 0,
      STARTING: [5.0, 6.0],
      RUNNING: [3.0, 5.0],
      IDLE: [1.0, 1.2],
      ABNORMAL: [6.0, 7.0]
    },
    criticality: 'HIGH',
    baselineEnergyPerHour: 4.0
  },
  {
    id: 'furnace_1',
    name: 'Furnace/Heater',
    powerConfig: {
      OFF: 0,
      STARTING: [6.0, 6.5],
      RUNNING: [4.0, 6.0],
      IDLE: [2.0, 2.5],
      ABNORMAL: [7.0, 8.0]
    },
    criticality: 'LOW',
    baselineEnergyPerHour: 5.0
  }
];

export interface MachineData {
  id: string;
  state: MachineState;
  actualPower: number;
  nilmEstimatedPower: number;
  energyConsumed: number; // kWh
  runtime: number; // hours
  anomalyScore: number;
  status: 'NORMAL' | 'WARNING' | 'REVIEW';
}

export interface SimulationState {
  time: number;
  running: boolean;
  productionOutput: number;
  productionTarget: number;
  energyIntensity: number;
  totalEnergy: number; // kWh
  totalPower: number; // kW
  machines: Record<string, MachineData>;
  waveform: { time: number; power: number }[];
  verifiedSavings: number; // kWh/day equivalent
  tariff: number;
  speedMultiplier: number;
}

export const createInitialState = (): SimulationState => {
  const machines: Record<string, MachineData> = {};
  for (const m of MACHINES) {
    machines[m.id] = {
      id: m.id,
      state: 'OFF',
      actualPower: 0,
      nilmEstimatedPower: 0,
      energyConsumed: 0,
      runtime: 0,
      anomalyScore: 0,
      status: 'NORMAL'
    };
  }

  return {
    time: 0,
    running: false,
    productionOutput: 0,
    productionTarget: 500,
    energyIntensity: 0,
    totalEnergy: 0,
    totalPower: 0,
    machines,
    waveform: [],
    verifiedSavings: 0,
    tariff: 8,
    speedMultiplier: 1,
  };
};

function getRandomPower(range: [number, number] | number): number {
  if (typeof range === 'number') return range;
  return range[0] + Math.random() * (range[1] - range[0]);
}

export function updateSimulation(state: SimulationState, dt: number): SimulationState {
  if (!state.running) return state;

  const newState = { ...state, time: state.time + dt };
  
  // Real world time step vs simulation time step
  const simDtHours = (dt / 3600) * state.speedMultiplier; 

  let newTotalPower = 0;
  const newMachines = { ...state.machines };

  for (const config of MACHINES) {
    const mState = newMachines[config.id];
    let power = 0;
    
    // Determine power based on state
    if (mState.state === 'OFF') {
      power = config.powerConfig.OFF;
    } else if (mState.state === 'STARTING') {
      power = getRandomPower(config.powerConfig.STARTING);
      // Automatically transition out of STARTING after some time (handled externally or simplified here)
      // We will handle state transitions in the scenario controller
    } else if (mState.state === 'RUNNING') {
      power = getRandomPower(config.powerConfig.RUNNING);
    } else if (mState.state === 'IDLE') {
      power = getRandomPower(config.powerConfig.IDLE);
    } else if (mState.state === 'ABNORMAL') {
      power = getRandomPower(config.powerConfig.ABNORMAL);
    }

    // Add noise
    const noise = (Math.random() - 0.5) * 0.2;
    power = Math.max(0, power + noise);

    // Update energy and runtime
    const energyIncrement = power * simDtHours;
    mState.energyConsumed += energyIncrement;
    if (mState.state !== 'OFF') {
      mState.runtime += simDtHours;
    }

    mState.actualPower = power;
    
    // Simple NILM simulation: actual power + some estimation error based on prototype CNN
    const nilmError = (Math.random() - 0.5) * 0.4;
    mState.nilmEstimatedPower = Math.max(0, power + nilmError);

    // Simple Anomaly Score calculation
    if (mState.state === 'ABNORMAL') {
      mState.anomalyScore = Math.min(100, mState.anomalyScore + 5);
      mState.status = 'WARNING';
    } else if (mState.state === 'IDLE' && mState.runtime > 2) { // arbitrary threshold
      mState.anomalyScore = Math.min(100, mState.anomalyScore + 2);
      mState.status = 'REVIEW';
    } else {
      mState.anomalyScore = Math.max(0, mState.anomalyScore - 1);
      if (mState.anomalyScore < 20) mState.status = 'NORMAL';
    }

    newTotalPower += power;
    newState.totalEnergy += energyIncrement;
  }

  // Update production based on running machines (simplified)
  let activeMachines = Object.values(newMachines).filter(m => m.state === 'RUNNING').length;
  if (activeMachines > 0) {
     newState.productionOutput += (activeMachines * 10) * simDtHours;
  }

  newState.totalPower = newTotalPower;
  if (newState.productionOutput > 0) {
    newState.energyIntensity = newState.totalEnergy / newState.productionOutput;
  }

  // Update waveform
  newState.waveform = [...newState.waveform, { time: newState.time, power: newTotalPower }].slice(-60); // keep last 60 points

  newState.machines = newMachines;
  return newState;
}
