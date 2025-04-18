/// <reference types="@sveltejs/kit" />
import type { User, Session } from "lucia";

declare namespace App {
  interface Locals {
    user: User | null;
    session: Session | null;
  }
}