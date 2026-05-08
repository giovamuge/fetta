export interface PackageType {
	weightKg: number;
	availableCount: number;
}

export interface NamedProportion {
	alias: string;
	weight: number;
}

export interface PartAllocation {
	partIndex: number;
	alias: string;
	proportionWeight: number;
	targetWeightKg: number;
	assignedWeightKg: number;
	/** Map from package weight (kg) → count assigned */
	breakdownBySize: Map<number, number>;
	packageCount: number;
}

export interface AllocationResult {
	parts: PartAllocation[];
	totalWeightKg: number;
	totalInputPackageCount: number;
	totalAbsoluteErrorKg: number;
	strategyUsed: string;
	totalAssignedPackageCount: number;
}
