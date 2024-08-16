import { createContext, useContext, useState } from 'react'
import { Alert } from 'react-native'

export const RecebimentoContext = createContext({
  selectedInvoices: [],
  setReceiptGroup: () => {},
  selectGroup: () => null,
})

const RecebimentoProvider = ({ children }) => {
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [invoiceItems, setInvoiceItems] = useState([])

  function handleModifySelectedInvoices(invoice) {
    const isInArray = selectedInvoices.findIndex(selected => selected.notafiscal.trim() === invoice.notafiscal.trim() && selected.fornecedor.trim() === invoice.fornecedor.trim())
    if(isInArray === -1) { //Não encontrado
      if(selectedInvoices.length > 0 && (selectedInvoices[0].fornecedor.trim() !== invoice.fornecedor.trim() || selectedInvoices[0].loja.trim() !== invoice.loja.trim())) {
        Alert.alert("Atenção!","Fornecedor diferente. Somente é possível agrupar notas de um mesmo fornecedor.");
        return
      }

      setSelectedInvoices([...selectedInvoices, invoice])
      setInvoiceItems([...invoiceItems, invoice.itens])
    } else {

      const newSelectedInvoices = selectedInvoices.filter(selected => selected.notafiscal.trim() !== invoice.notafiscal.trim() || selected.serie.trim() !== invoice.serie.trim() || selected.fornecedor.trim() !== invoice.fornecedor.trim() || selected.loja.trim() !== invoice.loja.trim())
      const newInvoiceItems = invoiceItems.filter(it => it.notafiscal && it.notafiscal.trim() !== invoice.notafiscal.trim() && it.fornecedor.trim() !== invoice.fornecedor.trim())
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
    <RecebimentoContext.Provider
      value={{ selectedInvoices, setSelectedInvoices, handleModifySelectedInvoices, invoiceItems, setInvoiceItems, handleCheckItem }}
    >
      {children}
    </RecebimentoContext.Provider>
  )
}

const useRecebimento = () => {
  const context = useContext(RecebimentoContext)

  return context
}

export { RecebimentoProvider, useRecebimento }
