import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Check, Search } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getLanguageList, searchLanguages } from "@/lib/languages";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const [open, setOpen] = useState(false);

	const changeLanguage = async (lng: string) => {
		await i18n.changeLanguage(lng);
		localStorage.setItem('i18nextLng', lng);
		setOpen(false);
		setSearchQuery("");
	};

	const languages = searchQuery ? searchLanguages(searchQuery) : getLanguageList();
	const currentLanguage = i18n.language;

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					<Globe className="h-4 w-4" />
					{currentLanguage && (
						<span className="absolute -top-1 -right-1 text-xs">
							{currentLanguage.toUpperCase()}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="p-2 border-b border-slate-200">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
						<Input
							placeholder="Search languages..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
					</div>
				</div>
				<ScrollArea className="h-96">
					{languages.length === 0 ? (
						<div className="p-4 text-center text-sm text-slate-500">
							No languages found
						</div>
					) : (
						<div className="p-1">
							{languages.map((lang) => (
								<DropdownMenuItem
									key={lang.code}
									onClick={() => changeLanguage(lang.code)}
									className="cursor-pointer flex items-center justify-between gap-2 py-2"
								>
									<div className="flex items-center gap-2 flex-1 min-w-0">
										<span className="text-lg flex-shrink-0">{lang.flag}</span>
										<div className="flex flex-col min-w-0 flex-1">
											<span className="font-medium text-sm truncate">{lang.name}</span>
											<span className="text-xs text-slate-500 truncate">{lang.nativeName}</span>
										</div>
									</div>
									{currentLanguage === lang.code && (
										<Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
									)}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</ScrollArea>
				<div className="p-2 border-t border-slate-200 text-xs text-slate-500 text-center">
					{languages.length} language{languages.length !== 1 ? "s" : ""} available
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
