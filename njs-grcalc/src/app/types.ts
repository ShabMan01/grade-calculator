export interface Assignment {
    date: string
    name: string
    type: string
    points: string
    excluded: boolean
  }
  
  export interface GradeType {
    type: string
    worth: number
  }
  
  export interface FormState {
    step: number
    sisData: string
    assignments: Assignment[]
    gradeTypes: GradeType[]
    equations: string[]
  }
  
  