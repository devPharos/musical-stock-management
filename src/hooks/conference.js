import { createContext, useContext, useState } from 'react'
import { Alert } from 'react-native'

export const ConferenceContext = createContext({
  selectedInvoices: [],
  setReceiptGroup: () => {},
  selectGroup: () => null,
})

const ConferenceProvider = ({ children }) => {
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [invoiceItems, setInvoiceItems] = useState([])

  function handleModifySelectedInvoices(invoice) {
    const isInArray = selectedInvoices.findIndex(selected => selected.notafiscal === invoice.notafiscal && selected.fornecedor === invoice.fornecedor)
    if(isInArray === -1) { //Não encontrado
      if(selectedInvoices.length > 0 && (selectedInvoices[0].fornecedor !== invoice.fornecedor || selectedInvoices[0].loja !== invoice.loja)) {
        Alert.alert("Atenção!","Fornecedor diferente. Somente é possível agrupar notas de um mesmo fornecedor.");
        return
      }

      setSelectedInvoices([...selectedInvoices, invoice])
      setInvoiceItems([...invoiceItems, invoice.itens])
    } else {

      const newSelectedInvoices = selectedInvoices.filter(selected => selected.notafiscal !== invoice.notafiscal || selected.serie !== invoice.serie || selected.fornecedor !== invoice.fornecedor || selected.loja !== invoice.loja)
      const newInvoiceItems = invoiceItems.filter(it => it.notafiscal !== invoice.notafiscal && it.fornecedor !== invoice.fornecedor)
      setInvoiceItems(newInvoiceItems)
      setSelectedInvoices(newSelectedInvoices)
    }
  }

  function handleCheckItem(item, quantidade = 0, numeroserie = '') {
    const newItems = invoiceItems.map(it => {
      if(it.notafiscal === item.notafiscal && it.fornecedor === item.fornecedor && it.codigodebarras === item.codigodebarras && it.item === item.item) {
        it.qtdConf = quantidade;
        it.numeroserie = numeroserie;
      }
    })
    setInvoiceItems(newItems)
  }

  return (
    <ConferenceContext.Provider
      value={{ selectedInvoices, handleModifySelectedInvoices, invoiceItems, handleCheckItem }}
    >
      {children}
    </ConferenceContext.Provider>
  )
}

const useConference = () => {
  const context = useContext(ConferenceContext)

  return context
}

export { ConferenceProvider, useConference }
