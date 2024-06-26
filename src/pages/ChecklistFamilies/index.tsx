import { useNavigate, useParams } from 'react-router-dom'
import { ButtonComponent } from '../../components/ButtonComponent'
import { MainContainer } from '../../templates/MainContainer'
import { SectionContainer } from '../../templates/SectionContainer'
import * as S from './styles'
import { ActionsFooterContainer } from '../../templates/ActionsFooterContainer'
import { useChecklists } from '../../contexts/ChecklistsContext'
import { CheckboxComponent } from '../../components/CheckboxComponent'
import { ChecklistFamiliesOptions } from '../../@types'

export function ChecklistFamilies() {
  const { familiesSelected, onFamiliesSelectedUpdate } = useChecklists()
  const navigate = useNavigate()
  const { id } = useParams()

  const IoTInputValue: keyof ChecklistFamiliesOptions = 'IoT'

  const updateFamiliesSelected = (val: keyof ChecklistFamiliesOptions) => {
    onFamiliesSelectedUpdate({
      ...familiesSelected,
      [val]: !familiesSelected[val],
    })
  }

  const goToMandatoryItems = () => {
    if (id) {
      navigate(`/mandatory-items/${id}`)
    } else {
      navigate('/mandatory-items')
    }
  }

  return (
    <MainContainer>
      <SectionContainer hasHeader>
        <S.ChecklistFamiliesContainer>
          <p>
            Selecione abaixo quais famílias de checklists você quer incluir
            nessa avaliação, além da checklist geral:
          </p>
          <form>
            <CheckboxComponent
              value={IoTInputValue}
              checked={familiesSelected[IoTInputValue]}
              labelText="Checklist IoT"
              onChange={(e) =>
                updateFamiliesSelected(
                  e.target.value as keyof ChecklistFamiliesOptions,
                )
              }
            />
          </form>
        </S.ChecklistFamiliesContainer>
      </SectionContainer>
      <ActionsFooterContainer hasMessage>
        <ButtonComponent text="Voltar" action={() => navigate(-1)} />
        <ButtonComponent text="Continuar" action={() => goToMandatoryItems()} />
      </ActionsFooterContainer>
    </MainContainer>
  )
}
