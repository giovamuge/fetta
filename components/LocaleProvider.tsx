"use client";

import {
	createContext,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { dictionaries, type Dict, type Locale } from "@/lib/i18n";

interface LocaleContextValue {
	locale: Locale;
	dict: Dict;
	setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
	locale: "it",
	dict: dictionaries.it,
	setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>("it");

	function setLocale(next: Locale) {
		setLocaleState(next);
		// Keep lang attribute in sync for screen readers
		document.documentElement.lang = next;
	}

	return (
		<LocaleContext.Provider
			value={{ locale, dict: dictionaries[locale], setLocale }}
		>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale() {
	return useContext(LocaleContext);
}
