"use client";

import { useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { supabase } from "@/lib/supabase";

export function DemoDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedDemoData = async () => {
    if (!supabase || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data: existingSchedule } = await supabase
        .from("schedule_types")
        .select("id")
        .eq("name", "Demo Day A")
        .maybeSingle();

      if (existingSchedule) {
        setMessage("Demo data already exists.");
        return;
      }

      const { data: dayA, error: dayAError } = await supabase
        .from("schedule_types")
        .insert({
          name: "Demo Day A",
          lunch_enabled: true,
          lunch_start: "11:10",
          lunch_end: "11:50"
        })
        .select("id")
        .single();

      if (dayAError || !dayA) {
        throw new Error(dayAError?.message ?? "Unable to create Demo Day A");
      }

      const { data: dayB, error: dayBError } = await supabase
        .from("schedule_types")
        .insert({
          name: "Demo Day B",
          lunch_enabled: true,
          lunch_start: "11:10",
          lunch_end: "11:50"
        })
        .select("id")
        .single();

      if (dayBError || !dayB) {
        throw new Error(dayBError?.message ?? "Unable to create Demo Day B");
      }

      const { data: insertedBlocks, error: blocksError } = await supabase
        .from("schedule_blocks")
        .insert([
          {
            schedule_type_id: dayA.id,
            name: "A1 Math",
            start_time: "08:00",
            end_time: "09:25",
            block_index: 1,
            is_lunch: false
          },
          {
            schedule_type_id: dayA.id,
            name: "A2 Science",
            start_time: "09:35",
            end_time: "11:00",
            block_index: 2,
            is_lunch: false
          },
          {
            schedule_type_id: dayA.id,
            name: "Lunch",
            start_time: "11:10",
            end_time: "11:50",
            block_index: 3,
            is_lunch: true
          },
          {
            schedule_type_id: dayA.id,
            name: "A3 English",
            start_time: "11:55",
            end_time: "13:20",
            block_index: 4,
            is_lunch: false
          },
          {
            schedule_type_id: dayB.id,
            name: "B1 History",
            start_time: "08:00",
            end_time: "09:25",
            block_index: 1,
            is_lunch: false
          },
          {
            schedule_type_id: dayB.id,
            name: "B2 Art",
            start_time: "09:35",
            end_time: "11:00",
            block_index: 2,
            is_lunch: false
          },
          {
            schedule_type_id: dayB.id,
            name: "Lunch",
            start_time: "11:10",
            end_time: "11:50",
            block_index: 3,
            is_lunch: true
          },
          {
            schedule_type_id: dayB.id,
            name: "B3 PE",
            start_time: "11:55",
            end_time: "13:20",
            block_index: 4,
            is_lunch: false
          }
        ])
        .select("id, name");

      if (blocksError || !insertedBlocks) {
        throw new Error(blocksError?.message ?? "Unable to create demo blocks");
      }

      const mathBlock = insertedBlocks.find((block) => block.name === "A1 Math");

      await supabase.from("tasks").insert([
        {
          title: "Finish Algebra worksheet",
          due_date: new Date().toISOString().slice(0, 10),
          schedule_block_id: mathBlock?.id ?? null
        },
        {
          title: "Read chapter 4 notes",
          due_date: null,
          schedule_block_id: null
        }
      ]);

      await supabase.from("schedule_overrides").insert({
        override_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        schedule_type_id: dayB.id
      });

      setMessage("Demo data loaded. Refresh tabs to see schedules, tasks, and override.");
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : "Failed to load demo data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AutoAwesomeIcon />}
        onClick={seedDemoData}
        disabled={isLoading}
      >
        {isLoading ? "Loading Demo..." : "Load Demo Data"}
      </Button>

      <Snackbar
        open={Boolean(message) || Boolean(error)}
        autoHideDuration={5000}
        onClose={() => {
          setMessage(null);
          setError(null);
        }}
      >
        <Alert severity={error ? "error" : "success"} variant="filled" sx={{ width: "100%" }}>
          {error ?? message}
        </Alert>
      </Snackbar>
    </>
  );
}
