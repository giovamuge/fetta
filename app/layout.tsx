import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const siteUrl = "https://fetta.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Fetta — Distribuzione proporzionale pacchi",
		template: "%s | Fetta",
	},
	description:
		"Distribuisci pacchi indivisibili tra più partecipanti in proporzione, minimizzando lo scarto. Distribute indivisible packages among recipients proportionally.",
	keywords: [
		"distribuzione pacchi",
		"package distribution",
		"proporzioni",
		"fetta",
		"ottimizzazione",
		"logistica",
	],
	authors: [{ name: "Fetta" }],
	openGraph: {
		type: "website",
		url: siteUrl,
		title: "Fetta — Distribuzione proporzionale pacchi",
		description:
			"Distribuisci pacchi indivisibili tra più partecipanti rispettando le proporzioni desiderate.",
		siteName: "Fetta",
	},
	twitter: {
		card: "summary",
		title: "Fetta — Distribuzione proporzionale pacchi",
		description:
			"Distribuisci pacchi indivisibili tra più partecipanti rispettando le proporzioni desiderate.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="it"
			suppressHydrationWarning
			className={cn(
				"h-full",
				"antialiased",
				geistSans.variable,
				geistMono.variable,
				"font-mono",
				jetbrainsMono.variable
			)}
		>
			<body className="min-h-full flex flex-col bg-background text-foreground">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<LocaleProvider>
						<TooltipProvider>{children}</TooltipProvider>
					</LocaleProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
