// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace with your project details from Supabase Dashboard
export const supabase = createClient(
  "https://dhucnpptlzdptqvbxtrd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodWNucHB0bHpkcHRxdmJ4dHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzE4ODEsImV4cCI6MjA3Mzk0Nzg4MX0.0-DoPOF-o9TY4vo29ijtLurXKpbk16BJEXVpSzji0qs"
);