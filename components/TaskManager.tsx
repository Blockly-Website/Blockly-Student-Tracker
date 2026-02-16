"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabase";
import { ScheduleBlock, Task } from "@/lib/types";

interface RawTask {
  id: string;
  title: string;
  due_date: string | null;
  schedule_block_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  schedule_block: { name: string } | { name: string }[] | null;
}

function formatDueDate(date: string | null): string {
  if (!date) return "No due date";
  const d = dayjs(date);
  const today = dayjs().startOf("day");
  const diff = d.startOf("day").diff(today, "day");
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < -1) return `${Math.abs(diff)} days overdue`;
  if (diff <= 7) return `Due ${d.format("dddd")}`;
  return `Due ${d.format("MMM D")}`;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [scheduleBlockId, setScheduleBlockId] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [autoCleanup, setAutoCleanup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((left, right) => {
        if (left.is_completed !== right.is_completed) {
          return left.is_completed ? 1 : -1;
        }

        if (!left.due_date || !right.due_date) {
          return left.due_date ? -1 : 1;
        }

        return left.due_date.localeCompare(right.due_date);
      }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    if (filter === "active") {
      return sortedTasks.filter((task) => !task.is_completed);
    }

    if (filter === "completed") {
      return sortedTasks.filter((task) => task.is_completed);
    }

    return sortedTasks;
  }, [filter, sortedTasks]);

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase environment variables are missing.");
      return;
    }

    setError(null);

    const [{ data: taskData, error: taskError }, { data: blockData, error: blockError }] =
      await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, due_date, schedule_block_id, is_completed, completed_at, created_at, schedule_block:schedule_blocks(name)")
          .order("created_at", { ascending: false }),
        supabase.from("schedule_blocks").select("id, name, schedule_type_id, start_time, end_time, block_index, is_lunch, created_at")
      ]);

    if (taskError || blockError) {
      setError(taskError?.message ?? blockError?.message ?? "Failed to load tasks.");
      return;
    }

    const normalizedTasks: Task[] = ((taskData ?? []) as RawTask[]).map((task) => ({
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      schedule_block_id: task.schedule_block_id,
      is_completed: task.is_completed,
      completed_at: task.completed_at,
      created_at: task.created_at,
      schedule_block: Array.isArray(task.schedule_block)
        ? task.schedule_block[0]
        : (task.schedule_block ?? undefined)
    }));

    setTasks(normalizedTasks);
    setScheduleBlocks((blockData ?? []) as ScheduleBlock[]);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const createTask = async () => {
    if (!supabase || !title.trim()) {
      return;
    }

    setError(null);

    const payload = {
      title: title.trim(),
      due_date: dueDate || null,
      schedule_block_id: scheduleBlockId || null
    };

    const { error: upsertError } = editingTaskId
      ? await supabase.from("tasks").update(payload).eq("id", editingTaskId)
      : await supabase.from("tasks").insert(payload);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setTitle("");
    setDueDate("");
    setScheduleBlockId("");
    setEditingTaskId(null);
    await loadData();
  };

  const beginEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDueDate(task.due_date ?? "");
    setScheduleBlockId(task.schedule_block_id ?? "");
    setError(null);
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setTitle("");
    setDueDate("");
    setScheduleBlockId("");
    setError(null);
  };

  const deleteTask = async (taskId: string) => {
    if (!supabase) {
      return;
    }

    setError(null);
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingTaskId === taskId) {
      cancelTaskEdit();
    }
    await loadData();
  };

  const toggleTask = async (task: Task) => {
    if (!supabase) {
      return;
    }

    setError(null);

    const isCompleted = !task.is_completed;

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
      .eq("id", task.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (isCompleted && autoCleanup) {
      const threshold = dayjs().subtract(30, "day").toISOString();
      await supabase
        .from("tasks")
        .delete()
        .eq("is_completed", true)
        .lt("completed_at", threshold);
    }

    await loadData();
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Tasks</Typography>
            <Typography variant="body2" color="text.secondary">
              {tasks.filter((t) => !t.is_completed).length} active &middot; {tasks.filter((t) => t.is_completed).length} done
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Task"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) void createTask(); }}
              fullWidth
            />
            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="Block"
              value={scheduleBlockId}
              onChange={(event) => setScheduleBlockId(event.target.value)}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {scheduleBlocks
                .slice()
                .sort((left, right) => left.block_index - right.block_index)
                .map((block) => (
                  <MenuItem key={block.id} value={block.id}>
                    {block.name}
                  </MenuItem>
                ))}
            </TextField>
            <Button variant="contained" onClick={createTask}>
              {editingTaskId ? "Update Task" : "Add Task"}
            </Button>
            {editingTaskId ? (
              <Button variant="outlined" onClick={cancelTaskEdit}>
                Cancel
              </Button>
            ) : null}
          </Stack>

          <FormControlLabel
            control={<Checkbox checked={autoCleanup} onChange={(event) => setAutoCleanup(event.target.checked)} />}
            label="Auto-clean completed tasks older than 30 days"
          />

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label="All" color={filter === "all" ? "primary" : "default"} onClick={() => setFilter("all")} />
            <Chip
              label="Active"
              color={filter === "active" ? "primary" : "default"}
              onClick={() => setFilter("active")}
            />
            <Chip
              label="Completed"
              color={filter === "completed" ? "primary" : "default"}
              onClick={() => setFilter("completed")}
            />
          </Stack>

          {visibleTasks.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5, borderRadius: 2, bgcolor: "action.hover" }}>
              <Typography variant="h2" sx={{ mb: 0.5 }}>
                \ud83d\udccb
              </Typography>
              <Typography color="text.secondary">
                {filter === "all" ? "No tasks yet \u2014 add one above!" : `No ${filter} tasks.`}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {visibleTasks.map((task) => (
                <Stack
                  key={task.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
                >
                  <Stack>
                    <Typography
                      sx={{
                        textDecoration: task.is_completed ? "line-through" : "none"
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: !task.is_completed && task.due_date && dayjs(task.due_date).isBefore(dayjs(), "day")
                          ? "error.main" : "text.secondary",
                        fontWeight: !task.is_completed && task.due_date && dayjs(task.due_date).isBefore(dayjs(), "day") ? 600 : 400,
                      }}
                    >
                      {formatDueDate(task.due_date)}
                      {task.schedule_block?.name ? ` \u00b7 ${task.schedule_block.name}` : ""}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.25} alignItems="center">
                    <Checkbox checked={task.is_completed} onChange={() => toggleTask(task)} />
                    <IconButton size="small" onClick={() => beginEditTask(task)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteTask(task.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
