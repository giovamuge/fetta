"use client";

import { History, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useLocale } from "@/components/LocaleProvider";
import { deserializeResult, type HistoryEntry } from "@/lib/history";

interface HistorySheetProps {
	entries: HistoryEntry[];
	onRestore: (entry: HistoryEntry) => void;
	onRemove: (id: string) => void;
	onClear: () => void;
}

export function HistorySheet({
	entries,
	onRestore,
	onRemove,
	onClear,
}: HistorySheetProps) {
	const { dict, locale } = useLocale();

	const dateFormatter = new Intl.DateTimeFormat(
		locale === "it" ? "it-IT" : "en-GB",
		{
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}
	);

	return (
		<Sheet>
			<SheetTrigger
				render={
					<Button variant="outline" size="sm">
						<History />
						{dict.history}
						{entries.length > 0 && (
							<Badge
								variant="secondary"
								className="ml-1 h-4 min-w-4 px-1 text-[10px]"
							>
								{entries.length}
							</Badge>
						)}
					</Button>
				}
			/>

			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>{dict.historyTitle}</SheetTitle>
					<SheetDescription>
						{dict.historyDescription}
					</SheetDescription>
				</SheetHeader>

				{entries.length === 0 ? (
					<div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
						{dict.historyEmpty}
					</div>
				) : (
					<>
						<ScrollArea className="flex-1">
							{entries.map((entry, i) => {
								const result = deserializeResult(entry.result);
								return (
									<div key={entry.id}>
										{i > 0 && <Separator />}
										<div className="flex flex-col gap-2 p-4">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0 space-y-0.5">
													<p className="truncate text-sm font-medium">
														{entry.name ||
															entry.proportions
																.map((p) => p.alias)
																.join(", ")}
													</p>
													<p className="text-xs text-muted-foreground">
														{dateFormatter.format(
															new Date(
																entry.createdAt
															)
														)}
													</p>
												</div>
												<div className="flex shrink-0 gap-1">
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() =>
															onRestore(entry)
														}
														aria-label={
															dict.historyRestore
														}
													>
														<RotateCcw />
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() =>
															onRemove(entry.id)
														}
														aria-label={
															dict.historyDelete
														}
													>
														<Trash2 />
													</Button>
												</div>
											</div>

											<div className="flex flex-wrap gap-1.5">
												{result.parts.map((part) => (
													<Badge
														key={part.partIndex}
														variant="secondary"
													>
														{part.alias}:{" "}
														{Math.round(
															part.assignedWeightKg *
																10
														) / 10}{" "}
														kg
													</Badge>
												))}
											</div>

											<div className="flex items-center gap-1.5">
												<Badge variant="outline">
													{
														result.totalAssignedPackageCount
													}
													/
													{
														result.totalInputPackageCount
													}{" "}
													{dict.packages.toLowerCase()}
												</Badge>
												<Badge variant="outline">
													Δ{" "}
													{Math.round(
														result.totalAbsoluteErrorKg *
															1000
													) / 1000}{" "}
													kg
												</Badge>
												<Badge
													variant={
														result.strategyUsed ===
														"exact"
															? "default"
															: "secondary"
													}
												>
													{result.strategyUsed}
												</Badge>
											</div>
										</div>
									</div>
								);
							})}
						</ScrollArea>

						<SheetFooter>
							<Button
								variant="outline"
								size="sm"
								className="w-full"
								onClick={onClear}
							>
								<Trash2 />
								{dict.historyClear}
							</Button>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
