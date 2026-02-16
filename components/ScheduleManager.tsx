"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { supabase } from "@/lib/supabase";
import { ScheduleBlock, ScheduleType } from "@/lib/types";

interface TemplateBlock {
  name: string;
  start_time: string;
  end_time: string;
  is_lunch?: boolean;
}

interface TemplateScheduleType {
  name: string;
  lunch_enabled: boolean;
  lunch_start: string | null;
  lunch_end: string | null;
  blocks: TemplateBlock[];
}

interface ScheduleTemplate {
  id: string;
  label: string;
  description: string;
  scheduleTypes: TemplateScheduleType[];
}

const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: "traditional-7",
    label: "Traditional 7-Period",
    description: "Seven shorter daily periods plus lunch.",
    scheduleTypes: [
      {
        name: "Traditional Day",
        lunch_enabled: true,
        lunch_start: "11:35",
        lunch_end: "12:05",
        blocks: [
          { name: "Period 1", start_time: "08:00", end_time: "08:50" },
          { name: "Period 2", start_time: "08:55", end_time: "09:45" },
          { name: "Period 3", start_time: "09:50", end_time: "10:40" },
          { name: "Period 4", start_time: "10:45", end_time: "11:35" },
          { name: "Lunch", start_time: "11:35", end_time: "12:05", is_lunch: true },
          { name: "Period 5", start_time: "12:10", end_time: "13:00" },
          { name: "Period 6", start_time: "13:05", end_time: "13:55" },
          { name: "Period 7", start_time: "14:00", end_time: "14:50" }
        ]
      }
    ]
  },
  {
    id: "ab-block",
    label: "A/B Block",
    description: "Alternating day schedule for schools that run every other day.",
    scheduleTypes: [
      {
        name: "Day A",
        lunch_enabled: true,
        lunch_start: "11:10",
        lunch_end: "11:50",
        blocks: [
          { name: "A1", start_time: "08:00", end_time: "09:30" },
          { name: "A2", start_time: "09:40", end_time: "11:10" },
          { name: "Lunch", start_time: "11:10", end_time: "11:50", is_lunch: true },
          { name: "A3", start_time: "11:55", end_time: "13:25" },
          { name: "A4", start_time: "13:35", end_time: "15:05" }
        ]
      },
      {
        name: "Day B",
        lunch_enabled: true,
        lunch_start: "11:10",
        lunch_end: "11:50",
        blocks: [
          { name: "B1", start_time: "08:00", end_time: "09:30" },
          { name: "B2", start_time: "09:40", end_time: "11:10" },
          { name: "Lunch", start_time: "11:10", end_time: "11:50", is_lunch: true },
          { name: "B3", start_time: "11:55", end_time: "13:25" },
          { name: "B4", start_time: "13:35", end_time: "15:05" }
        ]
      }
    ]
  },
  {
    id: "four-by-four",
    label: "4×4 Block",
    description: "Four long blocks per day with lunch.",
    scheduleTypes: [
      {
        name: "4x4 Day",
        lunch_enabled: true,
        lunch_start: "11:10",
        lunch_end: "11:50",
        blocks: [
          { name: "Block 1", start_time: "08:00", end_time: "09:30" },
          { name: "Block 2", start_time: "09:40", end_time: "11:10" },
          { name: "Lunch", start_time: "11:10", end_time: "11:50", is_lunch: true },
          { name: "Block 3", start_time: "11:55", end_time: "13:25" },
          { name: "Block 4", start_time: "13:35", end_time: "15:05" }
        ]
      }
    ]
  },
  {
    id: "rotating-abc",
    label: "Rotating A/B/C",
    description: "Three-day rotation with a daily flex block.",
    scheduleTypes: [
      {
        name: "Day A",
        lunch_enabled: true,
        lunch_start: "11:15",
        lunch_end: "11:50",
        blocks: [
          { name: "A Block 1", start_time: "08:00", end_time: "09:10" },
          { name: "A Block 2", start_time: "09:20", end_time: "10:30" },
          { name: "Flex / Advisory", start_time: "10:40", end_time: "11:15" },
          { name: "Lunch", start_time: "11:15", end_time: "11:50", is_lunch: true },
          { name: "A Block 3", start_time: "11:55", end_time: "13:05" },
          { name: "A Block 4", start_time: "13:15", end_time: "14:25" }
        ]
      },
      {
        name: "Day B",
        lunch_enabled: true,
        lunch_start: "11:15",
        lunch_end: "11:50",
        blocks: [
          { name: "B Block 1", start_time: "08:00", end_time: "09:10" },
          { name: "B Block 2", start_time: "09:20", end_time: "10:30" },
          { name: "Flex / Advisory", start_time: "10:40", end_time: "11:15" },
          { name: "Lunch", start_time: "11:15", end_time: "11:50", is_lunch: true },
          { name: "B Block 3", start_time: "11:55", end_time: "13:05" },
          { name: "B Block 4", start_time: "13:15", end_time: "14:25" }
        ]
      },
      {
        name: "Day C",
        lunch_enabled: true,
        lunch_start: "11:15",
        lunch_end: "11:50",
        blocks: [
          { name: "C Block 1", start_time: "08:00", end_time: "09:10" },
          { name: "C Block 2", start_time: "09:20", end_time: "10:30" },
          { name: "Flex / Advisory", start_time: "10:40", end_time: "11:15" },
          { name: "Lunch", start_time: "11:15", end_time: "11:50", is_lunch: true },
          { name: "C Block 3", start_time: "11:55", end_time: "13:05" },
          { name: "C Block 4", start_time: "13:15", end_time: "14:25" }
        ]
      }
    ]
  },
  {
    id: "custom-starter",
    label: "Custom Starter",
    description: "One blank schedule type you can fully edit.",
    scheduleTypes: [
      {
        name: "Custom Day",
        lunch_enabled: true,
        lunch_start: "12:00",
        lunch_end: "12:30",
        blocks: []
      }
    ]
  }
];

export function ScheduleManager() {
  const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [selectedScheduleTypeId, setSelectedScheduleTypeId] = useState<string>("");
  const [newScheduleName, setNewScheduleName] = useState("");
  const [lunchEnabled, setLunchEnabled] = useState(true);
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("12:30");

  const [blockName, setBlockName] = useState("");
  const [blockStart, setBlockStart] = useState("08:00");
  const [blockEnd, setBlockEnd] = useState("08:45");
  const [blockIndex, setBlockIndex] = useState("1");
  const [blockIsLunch, setBlockIsLunch] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("ab-block");
  const [templateNamePrefix, setTemplateNamePrefix] = useState("");
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const visibleBlocks = useMemo(
    () =>
      scheduleBlocks
        .filter((block) => block.schedule_type_id === selectedScheduleTypeId)
        .sort((left, right) => left.block_index - right.block_index),
    [scheduleBlocks, selectedScheduleTypeId]
  );

  const loadData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase environment variables are missing.");
      return;
    }

    setError(null);

    const [{ data: typeData, error: typeError }, { data: blockData, error: blockError }] =
      await Promise.all([
        supabase.from("schedule_types").select("*").order("created_at", { ascending: true }),
        supabase.from("schedule_blocks").select("*").order("block_index", { ascending: true })
      ]);

    if (typeError || blockError) {
      setError(typeError?.message ?? blockError?.message ?? "Failed to load schedules");
      return;
    }

    const loadedTypes = (typeData ?? []) as ScheduleType[];
    setScheduleTypes(loadedTypes);
    setScheduleBlocks((blockData ?? []) as ScheduleBlock[]);

    if (!selectedScheduleTypeId && loadedTypes.length > 0) {
      setSelectedScheduleTypeId(loadedTypes[0].id);
    }
  }, [selectedScheduleTypeId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const selectedType = scheduleTypes.find((type) => type.id === selectedScheduleTypeId);
    if (!selectedType) {
      return;
    }

    setNewScheduleName(selectedType.name);
    setLunchEnabled(selectedType.lunch_enabled);
    setLunchStart(selectedType.lunch_start?.slice(0, 5) ?? "12:00");
    setLunchEnd(selectedType.lunch_end?.slice(0, 5) ?? "12:30");
  }, [scheduleTypes, selectedScheduleTypeId]);

  const createScheduleType = async () => {
    if (!newScheduleName.trim() || !supabase) {
      return;
    }

    setError(null);

    const { error: insertError } = await supabase.from("schedule_types").insert({
      name: newScheduleName.trim(),
      lunch_enabled: lunchEnabled,
      lunch_start: lunchEnabled ? lunchStart : null,
      lunch_end: lunchEnabled ? lunchEnd : null
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNewScheduleName("");
    await loadData();
  };

  const updateScheduleType = async () => {
    if (!supabase || !selectedScheduleTypeId || !newScheduleName.trim()) {
      return;
    }

    setError(null);
    const { error: updateError } = await supabase
      .from("schedule_types")
      .update({
        name: newScheduleName.trim(),
        lunch_enabled: lunchEnabled,
        lunch_start: lunchEnabled ? lunchStart : null,
        lunch_end: lunchEnabled ? lunchEnd : null
      })
      .eq("id", selectedScheduleTypeId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  };

  const deleteScheduleType = async () => {
    if (!supabase || !selectedScheduleTypeId) {
      return;
    }

    setError(null);
    const { error: deleteError } = await supabase
      .from("schedule_types")
      .delete()
      .eq("id", selectedScheduleTypeId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSelectedScheduleTypeId("");
    setEditingBlockId(null);
    await loadData();
  };

  const createBlock = async () => {
    if (!selectedScheduleTypeId || !blockName.trim() || !supabase) {
      return;
    }

    setError(null);

    const payload = {
      schedule_type_id: selectedScheduleTypeId,
      name: blockName.trim(),
      start_time: blockStart,
      end_time: blockEnd,
      block_index: Number.parseInt(blockIndex, 10),
      is_lunch: blockIsLunch
    };

    const { error: upsertError } = editingBlockId
      ? await supabase.from("schedule_blocks").update(payload).eq("id", editingBlockId)
      : await supabase.from("schedule_blocks").insert(payload);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setBlockName("");
    setBlockStart("08:00");
    setBlockEnd("08:45");
    setBlockIndex("1");
    setBlockIsLunch(false);
    setEditingBlockId(null);
    await loadData();
  };

  const beginEditBlock = (block: ScheduleBlock) => {
    setEditingBlockId(block.id);
    setBlockName(block.name);
    setBlockStart(block.start_time.slice(0, 5));
    setBlockEnd(block.end_time.slice(0, 5));
    setBlockIndex(String(block.block_index));
    setBlockIsLunch(block.is_lunch);
    setError(null);
  };

  const cancelEditBlock = () => {
    setEditingBlockId(null);
    setBlockName("");
    setBlockStart("08:00");
    setBlockEnd("08:45");
    setBlockIndex("1");
    setBlockIsLunch(false);
    setError(null);
  };

  const deleteBlock = async (blockId: string) => {
    if (!supabase) {
      return;
    }

    setError(null);
    const { error: deleteError } = await supabase.from("schedule_blocks").delete().eq("id", blockId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingBlockId === blockId) {
      cancelEditBlock();
    }
    await loadData();
  };

  const applyTemplate = async () => {
    if (!supabase) {
      return;
    }

    const template = SCHEDULE_TEMPLATES.find((item) => item.id === selectedTemplateId);
    if (!template) {
      return;
    }

    setError(null);
    setIsApplyingTemplate(true);

    try {
      const existingNames = new Set(scheduleTypes.map((type) => type.name.toLowerCase()));
      const trimmedPrefix = templateNamePrefix.trim();
      const createdScheduleIds: string[] = [];

      const getUniqueName = (rawName: string) => {
        const baseName = trimmedPrefix ? `${trimmedPrefix} ${rawName}` : rawName;
        let candidate = baseName;
        let counter = 2;

        while (existingNames.has(candidate.toLowerCase())) {
          candidate = `${baseName} (${counter})`;
          counter += 1;
        }

        existingNames.add(candidate.toLowerCase());
        return candidate;
      };

      for (const scheduleType of template.scheduleTypes) {
        const name = getUniqueName(scheduleType.name);

        const { data: insertedType, error: typeError } = await supabase
          .from("schedule_types")
          .insert({
            name,
            lunch_enabled: scheduleType.lunch_enabled,
            lunch_start: scheduleType.lunch_start,
            lunch_end: scheduleType.lunch_end
          })
          .select("id")
          .single();

        if (typeError || !insertedType) {
          throw new Error(typeError?.message ?? "Failed to create schedule type.");
        }

        createdScheduleIds.push(insertedType.id);

        if (scheduleType.blocks.length > 0) {
          const blockRows = scheduleType.blocks.map((block, index) => ({
            schedule_type_id: insertedType.id,
            name: block.name,
            start_time: block.start_time,
            end_time: block.end_time,
            block_index: index + 1,
            is_lunch: Boolean(block.is_lunch)
          }));

          const { error: blockError } = await supabase.from("schedule_blocks").insert(blockRows);
          if (blockError) {
            throw new Error(blockError.message);
          }
        }
      }

      setTemplateNamePrefix("");
      await loadData();
      if (createdScheduleIds.length > 0) {
        setSelectedScheduleTypeId(createdScheduleIds[0]);
      }
    } catch (templateError) {
      const message = templateError instanceof Error ? templateError.message : "Failed to apply template.";
      setError(message);
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
      <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 40%" } }}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Schedule Setup Assistant</Typography>
              <Typography variant="body2" color="text.secondary">
                Start from a proven model (Traditional, 4×4, A/B, Rotating), then use overrides for special days.
              </Typography>
              <TextField
                select
                label="Template"
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                fullWidth
              >
                {SCHEDULE_TEMPLATES.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.label}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" color="text.secondary">
                {SCHEDULE_TEMPLATES.find((template) => template.id === selectedTemplateId)?.description}
              </Typography>
              <TextField
                label="Optional Name Prefix"
                value={templateNamePrefix}
                onChange={(event) => setTemplateNamePrefix(event.target.value)}
                placeholder="My School"
                fullWidth
              />
              <Button variant="contained" onClick={applyTemplate} disabled={isApplyingTemplate}>
                {isApplyingTemplate ? "Applying Template..." : "Apply Template"}
              </Button>

              <Typography variant="h6">Manual Schedule Type</Typography>
              <TextField
                label="Name"
                value={newScheduleName}
                onChange={(event) => setNewScheduleName(event.target.value)}
                fullWidth
              />
              <TextField
                select
                label="Lunch Enabled"
                value={lunchEnabled ? "yes" : "no"}
                onChange={(event) => setLunchEnabled(event.target.value === "yes")}
                fullWidth
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
              {lunchEnabled ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Lunch Start"
                    type="time"
                    value={lunchStart}
                    onChange={(event) => setLunchStart(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Lunch End"
                    type="time"
                    value={lunchEnd}
                    onChange={(event) => setLunchEnd(event.target.value)}
                    fullWidth
                  />
                </Stack>
              ) : null}
              <Button variant="contained" onClick={createScheduleType}>
                Create Schedule Type
              </Button>

              <TextField
                select
                label="Current Schedule"
                value={selectedScheduleTypeId}
                onChange={(event) => setSelectedScheduleTypeId(event.target.value)}
                fullWidth
              >
                {scheduleTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" onClick={updateScheduleType} disabled={!selectedScheduleTypeId}>
                  Update Selected
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={deleteScheduleType}
                  disabled={!selectedScheduleTypeId}
                >
                  Delete Selected
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: { xs: "1 1 auto", md: "1" } }}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Blocks</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Block Name"
                  value={blockName}
                  onChange={(event) => setBlockName(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Order"
                  type="number"
                  value={blockIndex}
                  onChange={(event) => setBlockIndex(event.target.value)}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Start"
                  type="time"
                  value={blockStart}
                  onChange={(event) => setBlockStart(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="End"
                  type="time"
                  value={blockEnd}
                  onChange={(event) => setBlockEnd(event.target.value)}
                  fullWidth
                />
                <TextField
                  select
                  label="Lunch Block"
                  value={blockIsLunch ? "yes" : "no"}
                  onChange={(event) => setBlockIsLunch(event.target.value === "yes")}
                  fullWidth
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </TextField>
              </Stack>
              <Button variant="contained" onClick={createBlock} disabled={!selectedScheduleTypeId}>
                {editingBlockId ? "Update Block" : "Add Block"}
              </Button>
              {editingBlockId ? (
                <Button variant="outlined" onClick={cancelEditBlock}>
                  Cancel Edit
                </Button>
              ) : null}

              <Divider />

              {visibleBlocks.length === 0 ? (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                  <Typography color="text.secondary">No blocks in this schedule yet.</Typography>
                </Box>
              ) : (
                <Box>
                  <Stack spacing={1}>
                    {visibleBlocks.map((block) => (
                      <Stack
                        key={block.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
                      >
                        <Stack>
                          <Typography>
                            {block.block_index}. {block.name}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {block.is_lunch ? <Chip label="Lunch" color="primary" size="small" /> : null}
                          <IconButton size="small" onClick={() => beginEditBlock(block)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => deleteBlock(block.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
