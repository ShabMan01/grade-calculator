'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GradeEntry {
    date: string
    name: string
    type: string
    resource: string
    score: string
    scoreType: string
    points: string
    notes: string
    excluded: boolean
}

export default function GradeCalculator() {
    const [sisData, setSisData] = useState('')
    const [showGradeExclusion, setShowGradeExclusion] = useState(false)
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [grades, setGrades] = useState<GradeEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleProceed = async () => {
        if (sisData.trim() === '') {
            setShowError(true)
            setErrorMessage('No data from SIS. Please enter data before proceeding.')
            setTimeout(() => setShowError(false), 3000) // Hide error after 3 seconds
            return
        }

        setIsLoading(true)
        setShowError(false)

        try {
            const response = await fetch('/api/parse-grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sisData }),
            })

            if (!response.ok) {
                throw new Error('Failed to parse grades')
            }

            const data = await response.json()
            if (data.error) {
                throw new Error(data.error)
            }

            const parsedGrades: GradeEntry[] = data.grades.map((grade: any) => ({
                date: grade[0],
                name: grade[1],
                type: grade[2],
                resource: grade[3],
                score: grade[4],
                scoreType: grade[5],
                points: grade[6],
                notes: grade[7],
                excluded: false,
            }))

            setGrades(parsedGrades)
            setShowGradeExclusion(true)
        } catch (error) {
            console.error('Error parsing grades:', error)
            setShowError(true)
            setErrorMessage('Error processing data. Please try again.')
            setTimeout(() => setShowError(false), 3000)
        } finally {
            setIsLoading(false)
        }
    }

    for (let key in grades) {
        let value = grades[key];
        console.log(value);
    }
    console.log("\n");

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">grade calculator 👍</h1>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <HelpCircle className="h-6 w-6" />
                </Button>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl">SIS Data:</h2>
                <Textarea
                    placeholder="copy and paste from sis"
                    value={sisData}
                    onChange={(e) => setSisData(e.target.value)}
                    className="min-h-[100px]"
                />
                <Button 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleProceed}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'proceed'}
                </Button>
            </div>

            {showError && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {errorMessage}
                    </AlertDescription>
                </Alert>
            )}

            {showGradeExclusion && (
                <div className="space-y-4">
                    <h2 className="text-xl">Grade Exclusion:</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4">date</th>
                                    <th className="text-left p-4">name</th>
                                    <th className="text-left p-4">type</th>
                                    <th className="text-left p-4">resource</th>
                                    <th className="text-left p-4">score</th>
                                    <th className="text-left p-4">score type</th>
                                    <th className="text-left p-4">points</th>
                                    <th className="text-left p-4">notes</th>
                                    <th className="text-left p-4">exclude?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((grade, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-4">{grade.date.substring(0,4) + "-" + grade.date.substring(8) + "-" + grade.date.substring(5,7)}</td>
                                        <td className="p-4">{grade.name}</td>
                                        <td className="p-4">{grade.type}</td>
                                        <td className="p-4">{grade.resource}</td>
                                        <td className="p-4">{grade.score[0] !== "Not Graded" ? grade.score[0] + "/" + grade.score[1] : grade.score[0]}</td>
                                        <td className="p-4">{grade.scoreType}</td>
                                        <td className="p-4">{!grade.points[0].includes(" Points Possible") ? grade.points[0] + "/" + grade.points[1] : grade.points[0]}</td>
                                        <td className="p-4">{grade.notes}</td>
                                        <td className="p-4">
                                            <Checkbox
                                                checked={grade.excluded}
                                                onCheckedChange={(checked) => {
                                                    const newGrades = [...grades]
                                                    newGrades[index].excluded = checked as boolean
                                                    setGrades(newGrades)
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                        proceed
                    </Button>
                </div>
            )}
        </div>
    )
}

