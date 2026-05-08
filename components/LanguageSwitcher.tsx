"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/LocaleProvider";
import { locales, type Locale } from "@/lib/i18n";

const localeLabels: Record<Locale, string> = {
	it: "Italiano",
	en: "English",
};

export function LanguageSwitcher() {
	const { locale, setLocale, dict } = useLocale();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="icon" aria-label={dict.language}>
						<Globe />
					</Button>
				}
			/>
			<DropdownMenuContent align="end">
				{locales.map((l) => (
					<DropdownMenuItem
						key={l}
						onClick={() => setLocale(l)}
						data-active={l === locale}
						className="data-[active=true]:font-semibold"
					>
						{localeLabels[l]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
