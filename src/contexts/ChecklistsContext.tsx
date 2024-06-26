import { ReactNode, createContext, useContext, useState } from 'react'
import { initialItems } from '../utils/constants/checklistInitial'
import {
  CategoriesType,
  ChecklistFamiliesOptions,
  ChecklistItemType,
} from '../@types'
import { useUsers } from './UsersContext'
import { useAuth } from './AuthContext'
import {
  getChecklistService,
  getChecklistServiceDefaultErrorMessage,
} from '../services/checklist/getChecklistService'
import { ChecklistDTO } from '../dtos/checklistDTO'
import { AppError } from '../utils/AppError'
import { useToast } from './ToastContext'

export interface ChecklistsContextType {
  checklist: ChecklistItemType[]
  familiesSelected: ChecklistFamiliesOptions
  categoriesSelected: CategoriesType
  currChecklistId: number | undefined
  filteredChecklist: (isMandatory: boolean, tag: string) => ChecklistItemType[]
  validateChecklist: (isMandatory: boolean) => string | null
  resetChecklist: () => void
  findIndexByIsMandatoryAndCode: (isMandatory: boolean, code: string) => number
  onChecklistUpdate: (checklist: ChecklistItemType[]) => void
  updateChecklistRow: (checklist: ChecklistItemType, index: number) => void
  onFamiliesSelectedUpdate: (familiesSelected: ChecklistFamiliesOptions) => void
  onCategoriesSelectedUpdate: (categoriesSelected: CategoriesType) => void
  progressData: (isMandatory: boolean) => { name: string; value: number }[]
  distributionData: (isMandatory: boolean) => { name: string; value: number }[]
  progressTableData: (isMandatory: boolean) => { name: string; value: number }[]
  loadChecklist: (id: number) => Promise<void>
  setCurrChecklistId: React.Dispatch<React.SetStateAction<number | undefined>>
}

const ChecklistsContext = createContext({} as ChecklistsContextType)

interface ChecklistsContextProviderProps {
  children: ReactNode
}

export function ChecklistsContextProvider({
  children,
}: ChecklistsContextProviderProps) {
  const [checklist, setChecklist] = useState<ChecklistItemType[]>(initialItems)
  const { user, onUserUpdate, setUserSystemId } = useUsers()
  const { toastError } = useToast()
  const { isLogged } = useAuth()

  const [categoriesSelected, setCategoriesSelected] = useState<CategoriesType>({
    Sim: true,
    Não: true,
    'Não se aplica': true,
    'Não Preenchido': true,
  })
  const [familiesSelected, setFamiliesSelected] =
    useState<ChecklistFamiliesOptions>({
      general: true,
      IoT: false,
    })
  const [currChecklistId, setCurrChecklistId] = useState<number | undefined>()

  const findIndexByIsMandatoryAndCode = (
    isMandatory: boolean,
    code: string,
  ) => {
    return checklist.findIndex(
      (item) => item.mandatory === isMandatory && item.code === code,
    )
  }

  const filteredChecklist = (isMandatory?: boolean, tag?: string) => {
    const filtered = checklist.filter(
      (row) =>
        (isMandatory === undefined || row.mandatory === isMandatory) &&
        (!tag || row.code.startsWith(tag)) &&
        familiesSelected[row.type] &&
        categoriesSelected[row.answer ? row.answer : 'Não Preenchido'],
    )

    return filtered
  }

  const onChecklistUpdate = (checklist: ChecklistItemType[]) => {
    setChecklist(checklist)
  }

  const updateChecklistRow = (row: ChecklistItemType, index: number) => {
    const checklistCopy = [...checklist]
    if (row.answer !== 'Não') {
      row.severityDegree = undefined
    }
    checklistCopy[index] = row
    setChecklist(checklistCopy)
  }

  const validateChecklist = (isMandatory: boolean): string | null => {
    for (const item of checklist) {
      if (
        item.answer === 'Não' &&
        item.mandatory === isMandatory &&
        !(item.severityDegree && item.userComment)
      ) {
        return 'Nos itens respondidos com "Não", preencha o grau de severidade e o comentário'
      }
    }
    return null
  }

  const resetChecklist = () => {
    setChecklist(initialItems)
    setCategoriesSelected({
      Sim: true,
      Não: true,
      'Não se aplica': true,
      'Não Preenchido': true,
    })
    setFamiliesSelected({
      general: true,
      IoT: false,
    })
    onUserUpdate({
      ...user,
      name: isLogged ? user.name : '',
      office: isLogged ? user.office : '',
      systemName: undefined,
      systemDesc: undefined,
      system: undefined,
    })
  }

  const progressData = (isMandatory: boolean) => {
    const progress = checklist.reduce((acc, curr) => {
      if (curr.mandatory === isMandatory && familiesSelected[curr.type]) {
        if (curr.answer) {
          return acc + 1
        }
      }
      return acc
    }, 0)

    return [
      {
        name: '',
        value:
          (progress /
            checklist.reduce((acc, curr) => {
              if (
                curr.mandatory === isMandatory &&
                familiesSelected[curr.type]
              ) {
                return acc + 1
              }
              return acc
            }, 0)) *
          100,
      },
    ]
  }

  const distributionData = (isMandatory: boolean) => {
    const distribution = checklist.reduce(
      (acc, curr) => {
        if (curr.mandatory === isMandatory && familiesSelected[curr.type]) {
          if (curr.answer === 'Sim') {
            const index = acc.findIndex(
              (obj) => obj.name === 'Taxa de Adequação',
            )
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          } else if (curr.answer === 'Não') {
            const index = acc.findIndex(
              (obj) => obj.name === 'Defeito/Problema',
            )
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          } else if (curr.answer === 'Não se aplica') {
            const index = acc.findIndex((obj) => obj.name === 'Não se aplica')
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          } else {
            const index = acc.findIndex((obj) => obj.name === 'Não preenchido')
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          }
        }
        return acc
      },
      [
        { name: 'Taxa de Adequação', value: 0 },
        { name: 'Defeito/Problema', value: 0 },
        { name: 'Não se aplica', value: 0 },
        { name: 'Não preenchido', value: 0 },
      ],
    )

    return [
      {
        name: 'Taxa de Adequação',
        value:
          (distribution[
            distribution.findIndex((obj) => obj.name === 'Taxa de Adequação')
          ].value /
            distribution.reduce((acc, curr) => acc + curr.value, 0)) *
          100,
      },
      {
        name: 'Defeito/Problema',
        value:
          (distribution[
            distribution.findIndex((obj) => obj.name === 'Defeito/Problema')
          ].value /
            distribution.reduce((acc, curr) => acc + curr.value, 0)) *
          100,
      },
      {
        name: 'Não se aplica',
        value:
          (distribution[
            distribution.findIndex((obj) => obj.name === 'Não se aplica')
          ].value /
            distribution.reduce((acc, curr) => acc + curr.value, 0)) *
          100,
      },
      {
        name: 'Não preenchido',
        value:
          (distribution[
            distribution.findIndex((obj) => obj.name === 'Não preenchido')
          ].value /
            distribution.reduce((acc, curr) => acc + curr.value, 0)) *
          100,
      },
    ]
  }

  const progressTableData = (isMandatory: boolean) => {
    const columnText = isMandatory
      ? 'Itens Obrigatórios'
      : 'Itens Não Obrigatórios'

    const rowsNames = [
      `${columnText} Adequados:`,
      `${columnText} Não Adequados:`,
      `${columnText} Não Aplicado:`,
      `${columnText} Não Preenchidos:`,
      'Total:',
    ]

    return checklist.reduce(
      (acc, curr) => {
        if (curr.mandatory === isMandatory && familiesSelected[curr.type]) {
          if (curr.answer === 'Sim') {
            const index = acc.findIndex((obj) => obj.name === rowsNames[0])
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          } else if (curr.answer === 'Não') {
            const index = acc.findIndex((obj) => obj.name === rowsNames[1])
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          } else if (curr.answer === 'Não se aplica') {
            const index = acc.findIndex((obj) => obj.name === rowsNames[2])
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          } else {
            const index = acc.findIndex((obj) => obj.name === rowsNames[3])
            acc[index] = { ...acc[index], value: acc[index].value + 1 }
          }
          const index = acc.findIndex((obj) => obj.name === rowsNames[4])
          acc[index] = { ...acc[index], value: acc[index].value + 1 }
        }
        return acc
      },
      [
        { name: rowsNames[0], value: 0 },
        { name: rowsNames[1], value: 0 },
        { name: rowsNames[2], value: 0 },
        { name: rowsNames[3], value: 0 },
        { name: rowsNames[4], value: 0 },
      ],
    )
  }

  const onFamiliesSelectedUpdate = (
    familiesSelected: ChecklistFamiliesOptions,
  ) => {
    setFamiliesSelected(familiesSelected)
  }

  const onCategoriesSelectedUpdate = (categoriesSelected: CategoriesType) => {
    setCategoriesSelected(categoriesSelected)
  }

  const setChecklistLoaded = (checklist: ChecklistDTO) => {
    setChecklist(checklist.checklistData)
    setUserSystemId(checklist.systemId)
    setFamiliesSelected({
      general: checklist.isGeneral,
      IoT: checklist.isIot,
    })
  }

  const loadChecklist = async (id: number) => {
    try {
      setCurrChecklistId(id)
      const data = await getChecklistService(id)

      setChecklistLoaded(data.checklist)
    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError
        ? error.message
        : getChecklistServiceDefaultErrorMessage
      toastError(title)
    }
  }

  return (
    <ChecklistsContext.Provider
      value={{
        checklist,
        familiesSelected,
        categoriesSelected,
        currChecklistId,
        filteredChecklist,
        validateChecklist,
        resetChecklist,
        onChecklistUpdate,
        updateChecklistRow,
        onFamiliesSelectedUpdate,
        onCategoriesSelectedUpdate,
        progressData,
        distributionData,
        progressTableData,
        findIndexByIsMandatoryAndCode,
        loadChecklist,
        setCurrChecklistId,
      }}
    >
      {children}
    </ChecklistsContext.Provider>
  )
}

export function useChecklists(): ChecklistsContextType {
  const context = useContext(ChecklistsContext)

  return context
}
