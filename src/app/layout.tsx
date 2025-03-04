import "./globals.css";
import "./popup-layout.scss";
import "react-modal-global/styles/modal.scss";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";

import { getConfig } from "@/wagmi";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ploan",
  description: "A personal loan tracker",
};

export default function RootLayout(props: { children: ReactNode }) {
  let initialState;

  try {
    headers()
      .then((headers) => {
        initialState = cookieToInitialState(getConfig(), headers.get("cookie"));
      })
      .catch((e) => {
        console.warn(
          "Failed to parse cookie to initial state; it will not be restored",
          e,
        );
      });
  } catch (e) {
    console.warn(
      "Failed to parse cookie to initial state; it will not be restored",
      e,
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialState={initialState}>{props.children}</Providers>
      </body>
    </html>
  );
}
