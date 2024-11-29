

import sys
import json
import traceback
from typing import List, Tuple, Union





def parseGrade(data: str) -> tuple[List[Tuple[str, str, str, str, tuple, str, tuple, str]], List[str]]:
    try:
        # split per line
        perLine = data.split("\n")

        # first stage of parsing assignments
        # (getting them in a tuple)
        perAssignmentGroup = []
        numCols = 5
        currTuple = []

        for index in range(len(perLine)):
            i = perLine[index]

            if len(currTuple) == numCols:
                perAssignmentGroup.append(tuple(currTuple))
                currTuple = []
            
            currTuple.append(i)

        if currTuple:  # Add any remaining items
            perAssignmentGroup.append(tuple(currTuple))

        # second & final stage of parsing assignments
        # (expanding the things that have multiple categories in one tuple index)
        perAssignment = []
        assignmentTypes = set()

        for date, name, type_resource, score, scoreType_points in perAssignmentGroup:
            type_resource_arr = type_resource.split("\t")
            if len(type_resource_arr) < 2:
                raise ValueError(f"Invalid type_resource format: {type_resource}")
            tipo = type_resource_arr[0]
            assignmentTypes.add(tipo)
            resource = type_resource_arr[1]

            scoreType_points_arr = scoreType_points.split("\t")
            if len(scoreType_points_arr) < 3:
                raise ValueError(f"Invalid scoreType_points format: {scoreType_points}")
            scoreType = scoreType_points_arr[0]
            points = scoreType_points_arr[1]
            notes = scoreType_points_arr[2]

            assignment = (
                "-".join(date.strip().split("/")[::-1]),
                name.strip(),
                tipo.strip(),
                resource.strip(),
                tuple(score.strip().split(" out of ")),
                scoreType.strip(),
                tuple(points.strip().split("/")),
                notes
            )
            
            perAssignment.append(assignment)

        assignmentTypes = list(assignmentTypes)

        return perAssignment, assignmentTypes
    except Exception as e:
        raise Exception(f"Error in parseGrade: {str(e)}")
    










def calculateEquations(grades: List[List[str]], types: List[List[Union[str, int]]]) -> List[str]:
    try:
        # categorize assignments under their assignment types
        assignmentTypes_assignment = {}
        for tipo, worth in types:
            assignmentTypes_assignment[tipo] = [worth]

        for date, name, tipo, resource, score, scoreType, points, notes in grades:
            assignmentTypes_assignment[tipo].append(points)

        # get the final equations
        finalEquations = []
        equation_add_arr = ["t="]
        
        for key in assignmentTypes_assignment:
            worth = int(assignmentTypes_assignment[key][0])
            pts = assignmentTypes_assignment[key][1:]
            nVals, dVals = [], []
            for toople in pts:
                if isinstance(toople, str):
                    toople = tuple(toople.split('/'))
                if len(toople) > 1:
                    nVals.append(toople[0])
                    dVals.append(toople[1])
                else:
                    nVals.append("-1")
                    d = toople[0].replace(" Points Possible", "")
                    dVals.append(d)

            # f=\frac{a+b+c+d}{a+b+c+d}
            finalString = f"{key[0].lower()}=\\frac{{{'+'.join(nVals)}}}{{{'+'.join(dVals)}}}"
            finalEquations.append(finalString)

            equation_add_arr.append(f"{worth/100}{key[0].lower()}")

        # t=100(0.3f+0.7s)
        finalEquations.append(f"{equation_add_arr[0]}100({'+'.join(equation_add_arr[1:])})")
        
        return finalEquations
    except Exception as e:
        raise Exception(f"Error in calculateEquations: {str(e)}")
    








if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        if 'sisData' in data:
            # Handle grade parsing request
            parsed_grades, types = parseGrade(data['sisData'])
            print(json.dumps({"grades": parsed_grades, "types": types}))
        elif 'grades' in data and 'types' in data:
            # Handle calculation request
            equations = calculateEquations(data['grades'], data['types'])
            print(json.dumps({"equations": equations}))
        else:
            print(json.dumps({"error": "Invalid input data"}))
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}), file=sys.stderr)
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}), file=sys.stderr)
        print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)






































# # print('\x1b[6;30;42m' + 'Success!' + '\x1b[0m')

# # "f=\frac{a+b+c+d}{a+b+c+d}"

# # gradesInputted = input("\033[44m" + "Are your copied-and-pasted grades from SIS in `grades.txt`? (y/n)" + "\033[0m  ")
# # print()
# # if gradesInputted != "y": exit()

# # data = ""
# # with open("grades.txt", "r") as f:
# #     data += f.readline()
# #     for line in f:
# #         data += line

# # with open("check.txt", "w") as f:
# #     f.write(data)

# # print(data)

# #---------------------------------------------------------------------------


# import sys
# import json
# from typing import List, Tuple, Union



# def parseGrade(data: str) -> tuple[List[Tuple[str, str, str, str, tuple, str, tuple, str]], List[str]]:

#     # split per line
#     perLine = data.split("\n")




#     # first stage of parsing assignments
#     # (gettting them in a tuple)
#     perAssignmentGroup = []
#     numCols = 5
#     currTuple = []

#     for index in range(len(perLine)):

#         i = perLine[index]

#         if len(currTuple) == numCols:
#             perAssignmentGroup.append(tuple(currTuple))
#             currTuple = []
        
#         currTuple.append(i)

#     perAssignmentGroup.append(tuple(currTuple))




#     # second & final stage of parsing assignments
#     # (expanding the things that have multiple categories in one tuple index)
#     perAssignment = []
#     assignmentTypes = set()

#     for date, name, type_resource, score, scoreType_points in perAssignmentGroup:
#         type_resource_arr = type_resource.split("\t")
#         tipo = type_resource_arr[0]; assignmentTypes.add(tipo)
#         resource = type_resource_arr[1]

#         scoreType_points_arr = scoreType_points.split("\t")
#         scoreType = scoreType_points_arr[0]
#         points = scoreType_points_arr[1]
#         notes = scoreType_points_arr[2]

#         assignment = (  "-".join( date.strip().split("/")[::-1] ),
#                         name.strip(),
#                         tipo.strip(),
#                         resource.strip(),
#                         tuple( score.strip().split(" out of ") ),
#                         scoreType.strip(),
#                         tuple( points.strip().split("/") ),
#                         notes
#                     )
        
#         perAssignment.append(assignment)

#     assignmentTypes = list(assignmentTypes)

#     return perAssignment, assignmentTypes














# def calculateEquations(  grades: List[List[str]],   types: List[List[Union[str, int]]]  ) -> List[str]:

#     try:
#         # categorize assignments under their assignment types
#         assignmentTypes_assignment = {}
#         for tipo, worth in types:
#             assignmentTypes_assignment[tipo] = [worth]


#         for date, name, tipo, resource, score, scoreType, points, notes in grades:
#             assignmentTypes_assignment[tipo].append(points)




#         # get the final equations
#         finalEquations = []
#         equation_add_arr = ["t="]
        
#         for key in assignmentTypes_assignment:
#             worth = int(assignmentTypes_assignment[key][0])
#             pts = assignmentTypes_assignment[key][1:]
#             nVals, dVals = [], []
#             for toople in pts:
#                 if (len(toople) > 1) :
#                     nVals.append( toople[0] )
#                     dVals.append( toople[1] )
#                 else:
#                     nVals.append( "-1" )
#                     d = toople[0].replace(" Points Possible", "")
#                     dVals.append( d )

#             # f=\frac{a+b+c+d}{a+b+c+d}
#             finalString = key[0].lower() + "=\\frac{" + "{}".format("+".join(nVals)) + "}" + \
#                                                     "{" + "{}".format("+".join(dVals)) + "}"
#             finalEquations.append(finalString)

#             equation_add_arr.append( str(worth/100) + key[0].lower() )
        

#         # t=0.3f+0.7s
#         finalEquations.append( equation_add_arr[0] + "100(" + "+".join(equation_add_arr[1:]) + ")" )

        
#     except Exception as e:
#         raise Exception(f"Error in calculateEquations: {str(e)}")



















# if __name__ == "__main__":
#     try:
#         input_data = sys.stdin.read()
#         data = json.loads(input_data)
        
#         if 'sisData' in data:
#             # Handle grade parsing request
#             parsed_grades, types = parseGrade(data['sisData'])
#             print(json.dumps({"grades": parsed_grades, "types": types}))
#         elif 'grades' in data and 'types' in data:
#             # Handle calculation request
#             equations = calculateEquations(data['grades'], data['types'])
#             print(json.dumps({"equations": equations}))
#         else:
#             print(json.dumps({"error": "Invalid input data"}))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}), file=sys.stderr)
























        





# #---------------------------------------------------------------------------

# # print("\33[33m" + str(assignmentTypes) + "\033[0m")

# # valid_type = input("\033[44m" + "Are the assignment types valid? (y/n)" + "\033[0m  ")

# # if (valid_type == "y"):

# #     # assignment type worth
# #     assignmentTypes_worth = []
# #     for tipo in assignmentTypes:
# #         worth = input("\033[44m" + f"How much are {tipo} assignments worth? (in %, without the \"%\")" + "\033[0m  ")
# #         assignmentTypes_worth.append((tipo, worth))
    
# #     print("\33[33m" + "\n", "----"*10, "\n" + "\033[0m")

# #     #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# #     for i in range(len(perAssignment)): print("\033[42m" + f"[{i}]: {perAssignment[i]}" + "\033[0m")

# #     #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# #     # exclude assignments
# #     excludeAssignments_str = input("\033[44m" + "\nWhich assignments (by number) do you exclude? (number with spaces per assignment; ENTER if none)" + "\033[0m\n" + "\033[34m" + "e.g. if don't want 1, 3, 14, write \"1 3 14\"" + "\033[0m  ")
# #     if (excludeAssignments_str != ""):
# #         excludeAssignments = [ int(i) for i in excludeAssignments_str.split(" ") ]
# #         perAssignment = [ perAssignment[i] for i in range(len(perAssignment)) if i not in excludeAssignments  ]
# #     print()

# #     #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# #     for i in range(len(perAssignment)): print("\033[42m" + f"[{i}]: {perAssignment[i]}" + "\033[0m")
# #     print()

# #     #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# #     # proceed to desmos
# #     # proceedToDesmos = input("\033[44m" + "Get equations & proceed to Desmos? (y/n)" + "\033[0m  ")

# #     # if (proceedToDesmos == "y"):
       
# #     assignmentTypes_assignment = {}
# #     for tipo, worth in assignmentTypes_worth:
# #         assignmentTypes_assignment[tipo] = [worth]


# #     for date, name, tipo, resource, score, scoreType, points, notes in perAssignment:
# #         assignmentTypes_assignment[tipo].append(points)


# #     #=========================
        
# #     finalEquations = []
# #     equation_add_arr = ["t="]
    
# #     for key in assignmentTypes_assignment:
# #         worth = int(assignmentTypes_assignment[key][0])
# #         pts = assignmentTypes_assignment[key][1:]
# #         nVals, dVals = [], []
# #         for toople in pts:
# #             if (len(toople) > 1) :
# #                 nVals.append( toople[0] )
# #                 dVals.append( toople[1] )
# #             else:
# #                 nVals.append( "-1" )
# #                 d = toople[0].replace(" Points Possible", "")
# #                 dVals.append( d )

# #         "f=\frac{a+b+c+d}{a+b+c+d}"
# #         finalString = key[0].lower() + "=\\frac{" + "{}".format("+".join(nVals)) + "}" + \
# #                                                 "{" + "{}".format("+".join(dVals)) + "}"
# #         finalEquations.append(finalString)

# #         equation_add_arr.append( str(worth/100) + key[0].lower() )
    

# #     "t=0.3f+0.7s"
# #     finalEquations.append( equation_add_arr[0] + "100(" + "+".join(equation_add_arr[1:]) + ")" )

# #     #=========================
# #     print("\33[33m" + "\nCopy and Paste the following equations to Desmos (https://desmos.com/graphing):" + "\033[0m")
# #     for eq in finalEquations: print("\033[43m " + eq + " \033[0m")

# #     print("\33[33m" + "Your grade at `t` is your final grade (in %)." + "\033[0m")

# #     print("\n\033[92m" + "~~~END OF PROGRAM~~~" + "\033[0m")

    
