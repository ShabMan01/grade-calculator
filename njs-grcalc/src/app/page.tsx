"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle } from 'lucide-react'
import { parseSISData, getUniqueTypes, generateEquations } from "./utils"
import type { FormState, Assignment, GradeType } from "./types"

export default function GradeCalculator() {
    const [state, setState] = useState<FormState>({
        step: 1,
        sisData: "",
        assignments: [],
        gradeTypes: [],
        equations: [],
    })

    const handleSISSubmit = () => {
        if (!state.sisData) return
        const assignments = parseSISData(state.sisData)
        const types = getUniqueTypes(assignments)
        setState({
            ...state,
            assignments,
            gradeTypes: types.map((type) => ({ type, worth: 0 })),
            step: 2,
        })
    }

    const handleExclusionSubmit = () => {
        setState({ ...state, step: 3 })
    }

    const handleTypesSubmit = () => {
        const equations = generateEquations(state.assignments, state.gradeTypes)
        setState({ ...state, equations, step: 4 })
    }

    const [isDialogOpen, setIsDialogOpen] = useState(false)
	function openYouTubeTutorial() {
        // console.log('tutorial');
        // window.open('https://www.youtube.com/@shabman01', '_blank');
        setIsDialogOpen(true);
    }

    const [copyButtonText, setCopyButtonText] = useState('Copy');
    const handleCopy = () => {
        const equationsText = state.equations.join('\n');
        navigator.clipboard.writeText(equationsText).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy'), 3000);
        });
    };

    return (
	<>
		<div className="flex justify-between items-center m-8">
			<div className="flex-1 text-center">
				<h1 className="text-2xl font-bold">grade calculator 👍</h1>
			</div>
			{/* <Button variant="ghost" size="icon" className="rounded-full" onClick={openYouTubeTutorial}>
				<HelpCircle className="h-8 w-8" />
			</Button> */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={openYouTubeTutorial}>
                    <HelpCircle className="h-8 w-8" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[75rem]">
                    <DialogHeader>
                    <DialogTitle>Demo Video</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/9xwxFD4Kxhk?si=xyAV1yqC9DLuWnOt"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    </div>
                </DialogContent>
                </Dialog>
		</div>

		






        <Card className="w-full max-w-6xl mx-auto mb-8">
            <CardContent className="space-y-6 mt-4">
                {/* Step 1: SIS Data */}
                {state.step >= 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">SIS Data:</h3>
                        <textarea
                            className="w-full min-h-[100px] p-2 border rounded"
                            value={state.sisData}
                            onChange={(e) => setState({ ...state, sisData: e.target.value })}
                            placeholder="Copy and paste your grades here..."
                        />
                        <Button onClick={handleSISSubmit} className="bg-green-500 hover:bg-green-600" disabled={!state.sisData}>
                            proceed
                        </Button>

                        <hr className="border-gray-300 my-16" />

                    </div>
                )}





                {/* Step 2: Grade Exclusion */}
                {state.step >= 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Grade Exclusion:</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>date</TableHead>
                                    <TableHead>name</TableHead>
                                    <TableHead>type</TableHead>
                                    <TableHead>score</TableHead>
                                    <TableHead>points</TableHead>
                                    <TableHead>notes</TableHead>
                                    <TableHead>excluded?</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.assignments.map((assignment, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{assignment.date}</TableCell>
                                        <TableCell>{assignment.name}</TableCell>
                                        <TableCell>{assignment.type}</TableCell>
                                        <TableCell>{assignment.score}</TableCell>
                                        <TableCell>{assignment.points}</TableCell>
                                        <TableCell>{assignment.notes}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={assignment.excluded}
                                                onCheckedChange={(checked) => {
                                                    const newAssignments = [...state.assignments]
                                                    newAssignments[i].excluded = checked as boolean
                                                    setState({ ...state, assignments: newAssignments })
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button onClick={handleExclusionSubmit} className="bg-blue-500 hover:bg-blue-600">
                            proceed
                        </Button>

                        <hr className="border-gray-300 my-16" />

                    </div>
                )}





                {/* Step 3: Types' Worth */}
                {state.step >= 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Types&apos; Worth:</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>type</TableHead>
                                    <TableHead>worth (in %)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.gradeTypes.map((gradeType, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{gradeType.type}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={gradeType.worth}
                                                onChange={(e) => {
                                                    const newTypes = [...state.gradeTypes]
                                                    newTypes[i].worth = Number(e.target.value)
                                                    setState({ ...state, gradeTypes: newTypes })
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button onClick={handleTypesSubmit} className="bg-red-500 hover:bg-red-600">
                            proceed
                        </Button>

                        <hr className="border-gray-300 my-16" />

                    </div>
                )}





                {/* Step 4: Your Equations & Next Steps */}
                {state.step >= 4 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Your Equations:</h3>
                        <div className="space-y-2">
                            {state.equations.map((equation, i) => (
                                <div key={i} className="font-mono">
                                    {equation}
                                </div>
                            ))}
                        </div>

                        <Button onClick={handleCopy} className="bg-purple-500 hover:bg-blue-600">
                            {copyButtonText}
                        </Button>

                        <hr className="border-gray-300 my-16" />

                        <div className="space-y-2">
                            <h4 className="text-lg font-medium">Next Steps:</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Copy the equations above.</li>
                                <li>
                                    Go to Desmos (
                                    <a
                                        href="https://desmos.com/graphing"
                                        className="text-blue-500 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        https://desmos.com/graphing
                                    </a>
                                    ) and paste.
                                </li>
                                <li>Change numbers in the numerator to simulate what your grade would be.</li>
                                <li>Your grade at <span className="font-mono">t</span> is your final grade (in %).</li>
                            </ol>
                        </div>

                        <iframe
                            title="Desmos Calculator"
                            src="https://www.desmos.com/calculator"
                            style={{ width: "100%", height: "500px", border: "0" }}
                            allowFullScreen
                        ></iframe>

                    </div>
                )}




            </CardContent>
        </Card>

        <div className="flex-1 text-center">
            <p className="text-sm text-neutral-500 m-4">v1.0 ; Made by&nbsp;
                <a
                    href="https://github.com/ShabMan01"
                    className="text-neutral-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Shabeer Manalai
                </a>
            </p>
        </div>
	</>
    )
}

