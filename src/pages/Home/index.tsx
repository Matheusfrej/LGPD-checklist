import { ButtonComponent } from '../../components/ButtonComponent'
import { MainContainer } from '../../templates/MainContainer'
import { Instructions } from './components/Instructions'
import { UserForm } from './components/UserForm'
import { VocabularyTable } from './components/VocabularyTable'
import { ActionsFooterContainer } from '../../templates/ActionsFooterContainer'
import { useState } from 'react'
// import { useParams } from 'react-router-dom'

export function Home() {
  const [pressed, setPressed] = useState(0)

  // const { id } = useParams()

  return (
    <MainContainer>
      <Instructions />
      <UserForm submitted={pressed} />
      <VocabularyTable />
      <ActionsFooterContainer>
        <div />
        <ButtonComponent
          text="Começar"
          action={() => {
            setPressed((state) => state + 1)
          }}
        />
      </ActionsFooterContainer>
    </MainContainer>
  )
}
