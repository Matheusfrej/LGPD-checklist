import { useTheme } from 'styled-components'
import { ChartsContainer } from '../../../../components/ChartsContainer'
import { SectionContainer } from '../../../../components/SectionContainer'
import { SectionTitleComponent } from '../../../../components/SectionTitleComponent'
import { SectionWithItemsTableComponent } from '../../../../components/SectionWithItemsTableComponent'
import { useChecklists } from '../../../../contexts/ChecklistsContext'

export function ReportContent() {
  const { nonMandatoryItemsClassifications, mandatoryItemsClassifications } =
    useChecklists()
  const theme = useTheme()

  const colors = [
    theme.colors.green,
    theme.colors.red,
    theme.colors.wheat,
    theme.colors.contrast,
  ]

  return (
    <>
      <SectionContainer>
        <SectionTitleComponent text="Gráficos" isSecondary />
        <SectionContainer style={{ marginBottom: 20 }}>
          <SectionTitleComponent
            text="Gráficos Itens Obrigatórios"
            isSecondary
          />
          <ChartsContainer isMandatory={true} colors={colors} />
        </SectionContainer>
        <SectionContainer>
          <SectionTitleComponent
            text="Gráficos Itens Não Obrigatórios"
            isSecondary
          />
          <ChartsContainer isMandatory={false} colors={colors} />
        </SectionContainer>
      </SectionContainer>
      <SectionContainer>
        <SectionWithItemsTableComponent
          classifications={mandatoryItemsClassifications}
          isMandatory
          isReport
          title="Tabelas de Itens Obrigatórios"
        />
      </SectionContainer>
      <SectionContainer>
        <SectionWithItemsTableComponent
          classifications={nonMandatoryItemsClassifications}
          isMandatory={false}
          isReport
          title="Tabelas de Itens Não Obrigatórios"
        />
      </SectionContainer>
    </>
  )
}