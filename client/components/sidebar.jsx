"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.png";
import MediaCapital from "@/public/cnn.png";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import { FaGavel, FaHome } from "react-icons/fa";
import { RiMoneyEuroCircleFill } from "react-icons/ri";
import { BiHealth, BiSolidCoinStack, BiWorld } from "react-icons/bi";
import { FaHandBackFist } from "react-icons/fa6";
import { IoBookSharp } from "react-icons/io5";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Command, CommandGroup, CommandItem } from "./ui/command";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  selectedParty,
  setSelectedParty,
  setConversation,
  setMessages,
  abortController,
  setLoading,
}) => {
  // const [dropdownOpen, setDropdownOpen] = useState(false);
  const parties = [
    "Todos",
    "BE",
    "Chega",
    "IL",
    "Livre",
    "PAN",
    "PCP",
    "PS",
    "PSD",
  ];

  const themeIcons = {
    Educação: <IoBookSharp className="text-white mx-auto" size={18} />,
    Saúde: <BiHealth className="text-white mx-auto" size={18} />,
    Economia: (
      <RiMoneyEuroCircleFill className="text-white mx-auto" size={18} />
    ),
    Justiça: <FaGavel className="text-white mx-auto" size={18} />,
    Ecologia: <BiWorld className="text-white mx-auto" size={18} />,
    Habitação: <FaHome className="text-white mx-auto" size={18} />,
    "Política Fiscal": (
      <BiSolidCoinStack className="text-white mx-auto" size={18} />
    ),
    "Direitos Sociais": (
      <FaHandBackFist className="text-white mx-auto" size={18} />
    ),
  };
  const themes = [
    "Educação",
    "Saúde",
    "Economia",
    "Justiça",
    "Ecologia",
    "Habitação",
    "Política Fiscal",
    "Direitos Sociais",
  ];

  // const handleDropdown = (party) => {
  //   if (selectedParty !== party) {
  //     abortController.abort(); // Cancel ongoing fetch request
  //     setLoading(false); // Set loading to false
  //     setConversation([]);
  //     setMessages([]);
  //     setSelectedParty(party);
  //     setDropdownOpen(false);
  //   } else {
  //     setSelectedParty(party);
  //     setDropdownOpen(false);
  //   }
  // };
  // const handleToggleClick = () => {
  //   toggleSidebar();
  //   setDropdownOpen(false); // Set dropdownOpen to false
  // };

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedParty);

  return (
    <Popover open={isSidebarOpen} onOpenChange={toggleSidebar}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isSidebarOpen}
          className="w-[200px] justify-between"
        >
          {parties.find((party) => party.toLowerCase() === value.toLowerCase())}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {parties.map((party) => (
              <CommandItem
                key={party}
                value={party}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  setSelectedParty(currentValue);
                  toggleSidebar();
                }}
              >
                {party}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value.toLowerCase() === party.toLowerCase()
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
  // <div className="absolute left-0 md:static z-20 flex flex-row space-x-2 font-primary">
  //   <div
  //     className={`flex transition-all duration-200 ease-in-out ${
  //       isSidebarOpen ? "w-64" : "w-0"
  //     } overflow-hidden h-screen bg-black shadow-xl py-6 flex-col`}
  //   >
  //     <div className="flex justify-center mb-8 px-6 cursor-pointer">
  //       <Link href={"https://www.mediacapital.pt/"} target="_blank">
  //         <Image
  //           src={MediaCapital}
  //           alt="Company Logo"
  //           width={180}
  //           height={200}
  //         />
  //       </Link>
  //     </div>
  //     <div className="mb-8 px-4 relative">
  //       <div
  //         className="flex justify-between items-center rounded-lg hover:bg-white/10 cursor-pointer text-sm"
  //         onClick={() => {
  //           abortController.abort();
  //           setLoading(false);
  //           setMessages([]);
  //           setConversation([]);
  //         }}
  //       >
  //         <p className="text-white text-xs p-2 font-bold">Nova conversa</p>
  //         <FaPlus className="text-white mr-2 font-bold" />
  //       </div>
  //     </div>
  //     <div className="mb-8 px-4 relative">
  //       <p className="text-[10px] text-[#888] mb-2 px-2">Escolhe o partido</p>
  //       <div
  //         className="flex justify-between items-center w-full rounded-lg hover:bg-white/10 cursor-pointer text-sm"
  //         onClick={() => setDropdownOpen(!dropdownOpen)}
  //       >
  //         <p className="text-white text-xs p-2 font-bold">
  //           {selectedParty || "Select Party"}
  //         </p>
  //         {dropdownOpen ? (
  //           <IoIosArrowUp className="text-white mr-2 font-bold" />
  //         ) : (
  //           <IoIosArrowDown className="text-white mr-2 font-bold" />
  //         )}
  //       </div>
  //       {dropdownOpen && (
  //         <div className="px-4 bg-transparent absolute top-full left-0 right-0  mt-1 rounded-lg shadow-lg z-10">
  //           {parties.map((party) => {
  //             if (party !== selectedParty) {
  //               return (
  //                 <div
  //                   key={party}
  //                   className="p-2 bg-black
  //                hover:bg-white/10 cursor-pointer text-white rounded-lg"
  //                   onClick={() => handleDropdown(party)}
  //                 >
  //                   <p className="text-xs">{party}</p>
  //                 </div>
  //               );
  //             }
  //           })}
  //         </div>
  //       )}
  //     </div>
  //     <div className="flex-1 overflow-auto px-4">
  //       {!dropdownOpen && (
  //         <>
  //           <p className="text-[10px] text-[#888] mb-2 px-2">
  //             Temas sugeridos
  //           </p>
  //           <div className="grid grid-cols-2 gap-2">
  //             {themes.map((theme) => (
  //               <div
  //                 key={theme}
  //                 className="flex flex-col space-y-2 p-2 text-white border-[1px] border-white/20 rounded-lg"
  //               >
  //                 {themeIcons[theme]}
  //                 <p className="text-xs font-semibold mx-auto">{theme}</p>
  //               </div>
  //             ))}
  //           </div>
  //         </>
  //       )}
  //     </div>
  //     <div className="flex flex-col justify-center space-y-1 px-6 cursor-pointer">
  //       <p className="text-[10px] text-[#888]">Powered by</p>
  //       <Link href={"https://www.augustalabs.co/"} target="_blank">
  //         <Image src={Logo} alt="Company Logo" width={180} height={90} />
  //       </Link>
  //     </div>
  //   </div>
  //   <div className="flex justify-end px-0">
  //     {isSidebarOpen ? (
  //       <RxDoubleArrowLeft
  //         className="text-black my-auto cursor-pointer hover:scale-105 hover:opacity-20 transition-all duration-200"
  //         size={25}
  //         onClick={handleToggleClick}
  //       />
  //     ) : (
  //       <RxDoubleArrowRight
  //         className="text-black my-auto cursor-pointer hover:scale-105 hover:opacity-20 transition-all duration-200"
  //         size={25}
  //         onClick={handleToggleClick}
  //       />
  //     )}
  //   </div>
  // </div>
};

export default Sidebar;
