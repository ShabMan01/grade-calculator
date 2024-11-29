

'use client'




import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { HelpCircle, Copy, CheckIcon } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"




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



interface TypeWorth {
  type: string
  worth: string
}



interface CalculationResult {
  equations: string[] | null;
  error?: string;
}












export default function GradeCalculator() {




  const [sisData, setSisData] = useState('')
  const [showGradeExclusion, setShowGradeExclusion] = useState(false)
  const [showTypesWorth, setShowTypesWorth] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [types, setTypes] = useState<TypeWorth[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)












  const handleProceed = async () => {
    if (sisData.trim() === '') {
      setShowError(true)
      setErrorMessage('No data from SIS. Please enter data before proceeding.')
      setTimeout(() => setShowError(false), 3000)
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

      const parsedTypes: TypeWorth[] = data.types.map((type: string) => ({
        type,
        worth: '0',
      }))

      setGrades(parsedGrades)
      setTypes(parsedTypes)
      setShowGradeExclusion(true)
      setShowTypesWorth(false)
    } catch (error) {
      console.error('Error parsing grades:', error)
      setShowError(true)
      setErrorMessage('Error processing data. Please try again.')
      setTimeout(() => setShowError(false), 3000)
    } finally {
      setIsLoading(false)
    }
  }













  const handleTypeWorthChange = (index: number, worth: string) => {
    const newTypes = [...types]
    newTypes[index].worth = worth
    setTypes(newTypes)
  }












  const handleShowTypesWorth = () => {
    setShowTypesWorth(true)
  }










  const handleFinalProceed = async () => {
    try {
      setIsLoading(true)
      // Filter out excluded grades
      const includedGrades = grades.filter(grade => !grade.excluded).map(grade => [
        grade.date,
        grade.name,
        grade.type,
        grade.resource,
        grade.score,
        grade.scoreType,
        grade.points,
        grade.notes
      ])

      // Format types with their worth
      const typeWorth = types.map(type => [type.type, parseInt(type.worth)])

      const response = await fetch('/api/calculate-equations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: includedGrades,
          types: typeWorth,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate equations')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setCalculationResult({ equations: Array.isArray(data.equations) ? data.equations : null })
    } catch (error) {
      console.error('Error calculating equations:', error)
      setCalculationResult({ equations: null, error: error instanceof Error ? error.message : 'An unknown error occurred' })
    } finally {
      setIsLoading(false)
    }
  }







  const copyText = () => {
    let eqs = document.querySelectorAll(".equationsTextbox");
    let finalCopyString = "";

    eqs.forEach(div => {
      finalCopyString += div.textContent + "\n";
    });

    navigator.clipboard.writeText(finalCopyString).then(() => {
      let btn = document.getElementById("copyButton");
      
      if (btn) {
        const originalText = btn.textContent;
        
        btn.textContent = "Copied!";
        
        setTimeout(() => {
         btn.textContent = originalText;
        }, 1500);
      }
    });
  }



  function openYouTubeTutorial() {
    console.log('tutorail');
    window.open('https://www.youtube.com/@shabman01', '_blank');
  }


  




  


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16 mb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">grade calculator 👍</h1>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={openYouTubeTutorial}>
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
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-xl">Grade Exclusion:</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">date</th>
                    <th className="text-left p-2">name</th>
                    <th className="text-left p-2">type</th>
                    <th className="text-left p-2">resource</th>
                    <th className="text-left p-2">score</th>
                    <th className="text-left p-2">score type</th>
                    <th className="text-left p-2">points</th>
                    <th className="text-left p-2">notes</th>
                    <th className="text-left p-2">exclude?</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{grade.date.substring(0,4) + "-" + grade.date.substring(8) + "-" + grade.date.substring(5,7)}</td>
                      <td className="p-2">{grade.name}</td>
                      <td className="p-2">{grade.type}</td>
                      <td className="p-2">{grade.resource}</td>
                      <td className="p-2">{grade.score[0] !== "Not Graded" ? grade.score[0] + "/" + grade.score[1] : grade.score[0]}</td>
                      <td className="p-2">{grade.scoreType}</td>
                      <td className="p-2">{!grade.points[0].includes(" Points Possible") ? grade.points[0] + "/" + grade.points[1] : grade.points[0]}</td>
                      <td className="p-2">{grade.notes}</td>
                      <td className="p-2">
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
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleShowTypesWorth}
            >
              proceed
            </Button>
          </div>














          {showTypesWorth && (
            <div className="space-y-4">
              <h2 className="text-xl">Types&apos; Worth:</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">type</th>
                      <th className="text-left p-2">worth (in %)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {types.map((type, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{type.type}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={type.worth}
                            onChange={(e) => handleTypeWorthChange(index, e.target.value)}
                            className="w-24 text-center"
                            min="0"
                            max="100"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={handleFinalProceed}
              >
                proceed
              </Button>
            </div>
          )}
        </div>
      )}















      {calculationResult && (
        <>
          <div className="border-t border-b border-dashed border-gray-200 mt-8" />
          
          <div className="space-y-6 mt-12">
            <h2 className="text-xl">Your Equations:</h2>
            <Card>
              <CardContent className="p-6 space-y-2 font-mono">
                {
                    
                calculationResult.error ?
                (
                  <div className="text-red-500">{calculationResult.error}</div>
                )
                
                : calculationResult.equations && calculationResult.equations.length > 0 ?
                (
                  calculationResult.equations.map((equation, index) => (
                    <div key={index} className="text-lg equationsTextbox">{equation}</div>
                  ))
                )
                
                : (
                  <div>No equations generated. Please check your input data.</div>
                )
                
                }

              </CardContent>
            </Card>
          </div>

          <button
          id="copyButton"
          className="w-full mb-8 py-2 bg-yellow-400 hover:bg-yellow-300 text-white text-m"
          onClick={copyText}
          > copy equations
          </button>










          {!calculationResult.error && calculationResult.equations && calculationResult.equations.length > 0 && (
            <>
              <div className="border-t border-b border-dashed border-gray-200 my-8" />

              <div className="space-y-4 mt-12">
                <h2 className="text-xl">Next Steps:</h2>
                <ol className="list-decimal list-inside space-y-3">
                  <li>Copy the equations above.</li>
                  <li>
                    Go to Desmos (
                    <a 
                      href="https://desmos.com/graphing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      https://desmos.com/graphing
                    </a>
                    ) and paste into Desmos.
                  </li>
                  <li>
                    If wanted, change numbers in the numerator to simulate what your grade change would be.
                  </li>
                  <li>
                    Your grade at &apos;t&apos; is your final grade (in %).
                  </li>
                </ol>
              </div>
            </>
          )}





        </>
      )}
    </div>
  )
}

