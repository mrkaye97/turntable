"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useFiles } from "@/app/contexts/FilesContext";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import { DiffEditor } from "@monaco-editor/react";
interface BranchReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

}

const DiffView = ({
    original,
    modified,
}: {
    original: string;
    modified: string;
}) => (
    <DiffEditor
        text-muted-foreground
        original={original}
        modified={modified}
        language="sql"
        options={{
            minimap: { enabled: false },
            scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                verticalSliderSize: 8,
                horizontalSliderSize: 8,
            },
            lineNumbers: "on",
            wordWrap: "on",
            fontSize: 14,
            lineNumbersMinChars: 3,
        }}
        theme="mutedTheme"
    />
)


export default function BranchReviewDialog({
    open,
    onOpenChange,
}: BranchReviewDialogProps) {
    const handleOpenChange = useCallback((open: boolean) => {
        onOpenChange(open);
    }, [onOpenChange]);


    const [selectedChangeIndex, setSelectedChangeIndex] = useState<number | undefined>(undefined);
    const [selectedTab, setSelectedTab] = useState<"files" | "external">("files");

    const { changes, fetchChanges } = useFiles();

    useEffect(() => {
        fetchChanges();
    }, []);

    console.log({ selectedTab })


    useEffect(() => {
        if (changes?.length > 0) {
            setSelectedChangeIndex(0);
        }
    }, [changes])



    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='w-full max-w-[1500px] min-h-[1000px]'>
                <div className="flex gap-4  h-full">
                    <div className="w-1/4  h-full justify-between flex-col flex">
                        <div>
                            <div className="space-y-2">
                                <Tabs defaultValue="members" onValueChange={(value) => setSelectedTab(value as "files" | "external")}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="files" className="text-muted-foreground">
                                            <div className="flex items-center space-x-2">
                                                <div>Files</div>
                                            </div>
                                        </TabsTrigger>
                                        <TabsTrigger value="external">
                                            <div className="flex items-center space-x-2">
                                                <div>External Changes</div>
                                            </div>
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            {selectedTab === "files" ? (
                                <>
                                    <div className='mt-4'>
                                        <label className="text-sm font-medium">Branch</label>
                                        <select
                                            className="w-full h-8 rounded-md border border-input bg-background text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled
                                        >
                                            <option>posthog-events</option>
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label className="text-sm font-medium">Commit message</label>
                                        <textarea
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Latest changes on posthog-events"
                                        />
                                    </div>
                                    <div className='mt-4'>
                                        <label className="text-sm font-medium">Files changed</label>
                                        <div className='gap-1 flex flex-col overflow-y-scroll max-h-[300px]'>
                                            {(changes || []).map((change: any, index: number) => (
                                                <div className={`text-sm flex justify-between py-0.5 hover:bg-muted rounded-md hover:cursor-pointer ${selectedChangeIndex === index ? "bg-muted" : ""}`} key={index}>
                                                    <div className='flex items-center gap-2'>
                                                        <Checkbox />
                                                        <div onClick={() => setSelectedChangeIndex(index)}>{change.path}</div>
                                                    </div>
                                                    {change.type === "untracked" && <Badge variant='outline' className='text-green-500'>A</Badge>}
                                                    {change.type === "modified" && <Badge variant='outline' className='text-blue-500'>M</Badge>}
                                                    {change.type === "staged" && <Badge variant='outline' className='text-yellow-500'>S</Badge>}
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Switch />
                                        <label className="text-sm font-medium">Open pull request</label>
                                    </div>
                                </>
                            ) : (
                                <div className='flex flex-col gap-4'>
                                    <div className="mt-4 space-y-2">
                                        <label className="text-sm font-medium">Schema</label>
                                        <select
                                            className="w-full h-8 rounded-md border border-input bg-background text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled
                                        >
                                            <option>posthog-events</option>
                                        </select>
                                        <div className="text-xs text-muted-foreground">This schema is automatically created for you and will be deleted when you merge this project</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Metabase Changes</label>
                                        <div className="text-xs text-muted-foreground italic">No changes</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='flex flex-col gap-4'>
                            <div className='text-xs text-muted-foreground'>
                                Committing as <b>Turntable</b>.<br />
                                <a href="https://github.com/" target="_blank" className='text-black'>Sign into Github</a> to use your account
                            </div>
                            <div className='flex gap-2 justify-end'>
                                <Button variant="outline">Cancel</Button>
                                <Button>Commit</Button>
                            </div>
                        </div>
                    </div>

                    <div className="pl-1 w-3/4">
                        {selectedChangeIndex !== undefined && selectedTab === "files" && (
                            <DiffView key={selectedChangeIndex} original={changes?.[selectedChangeIndex].before} modified={changes?.[selectedChangeIndex].after} />
                        )}
                        {selectedTab === "external" && (
                            <div className='flex items-center justify-center h-full italic text-muted-foreground'>
                                No external BI changes
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
