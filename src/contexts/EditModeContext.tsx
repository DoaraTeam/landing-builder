"use client";

import { createContext, useContext } from "react";

interface EditModeContextType {
  isEditMode: boolean;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
});

export const useEditMode = () => useContext(EditModeContext);

interface EditModeProviderProps {
  children: React.ReactNode;
  isEditMode: boolean;
}

export function EditModeProvider({ children, isEditMode }: EditModeProviderProps) {
  return <EditModeContext.Provider value={{ isEditMode }}>{children}</EditModeContext.Provider>;
}
