import type { FormState, Assignment, GradeType } from "./types.ts"


export function parseSISData(data: string): Assignment[] {
  const lines = data.split("\n")
  const assignments: Assignment[] = []

  for (let i = 0; i < lines.length; i += 5) {
    if (i + 4 < lines.length) {
      const [date, name, typeInfo, score, points] = lines.slice(i, i + 5)

      if (date && name && typeInfo) {
        const type = typeInfo.split("\t")[0]
        assignments.push({
          date: date.trim(),
          name: name.trim(),
          type: type.trim(),
          score: score.trim(),
          points: points.split("\t")[1]?.trim() || "0/0",
          notes: points.split("\t")[2]?.trim() || "",
          excluded: false,
        })
      }
    }
  }

  return assignments
}

export function getUniqueTypes(assignments: Assignment[]): string[] {
  return Array.from(new Set(assignments.map((a) => a.type)))
}

export function generateEquations(assignments: Assignment[], gradeTypes: GradeType[]): string[] {
  const typeAssignments: Record<string, { worth: number; points: string[] }> = {}

  // Group assignments by type
  assignments
    .filter((a) => !a.excluded)
    .forEach((assignment) => {
      if (!typeAssignments[assignment.type]) {
        const worth = gradeTypes.find((t) => t.type === assignment.type)?.worth || 0
        typeAssignments[assignment.type] = { worth, points: [] }
      }
      typeAssignments[assignment.type].points.push(assignment.points)
    })

  const equations: string[] = []
  const addends: string[] = []

  // Generate equation for each type
  Object.entries(typeAssignments).forEach(([type, data]) => {
    const { points, worth } = data
    const numerators: string[] = []
    const denominators: string[] = []

    points.forEach((point) => {
      if (point.includes("Points Possible")) {
        const ppValue = point.replace(" Points Possible", "")
        numerators.push(`${ppValue}PP`)
        denominators.push(ppValue)
      } else {
        const [n, d] = point.split("/")
        numerators.push(n)
        denominators.push(d)
      }
    })

    const typeVar = type.charAt(0).toLowerCase()
    equations.push(`${typeVar}=\\frac{${numerators.join("+")}}{${denominators.join("+")}}`)
    addends.push(`${worth / 100}${typeVar}`)
  })

  // Add final equation
  equations.push(`t=100(${addends.join("+")})`)

  return equations
}

