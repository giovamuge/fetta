"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/LocaleProvider";

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();
	const { dict } = useLocale();

	const icon =
		theme === "light" ? (
			<Sun />
		) : theme === "dark" ? (
			<Moon />
		) : (
			<SunMoon />
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="icon"
						aria-label={dict.theme}
					>
						{icon}
					</Button>
				}
			/>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<Sun />
					{dict.themeLight}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<Moon />
					{dict.themeDark}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<SunMoon />
					{dict.themeSystem}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
