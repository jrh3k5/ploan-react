"use client";

import { PersonalLoan } from "@/models/personal_loan";

export interface DeleteLoanModalProps {
  loan: PersonalLoan;
  onDeletion: () => Promise<void>;
}

export function DeleteLoanModal(props: DeleteLoanModalProps) {}
