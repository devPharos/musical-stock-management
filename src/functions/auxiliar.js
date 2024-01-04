import axios from 'axios'
import { API_URL } from '../../config'

async function getReceiptData(
  receiptCode,
  user,
) {
  const config = {
    headers: {
      Authorization: `Bearer ${user?.access_token}`,
    },
    params: {
      chavenf: receiptCode,
    },
  }

  const response = await axios.get(`${API_URL}/rest/wBuscaNF`, config)
  const {
    loja,
    serie,
    emissao,
    razaosocial,
    tiponotafiscal,
    notafiscal,
    itens,
    fornecedor,
  } = response.data

  return {
    loja,
    serie,
    fornecedor,
    emissao,
    razaosocial,
    tiponotafiscal,
    notafiscal,
    itens,
  }
}

export async function FindReceiptData(
  receiptCode,
  user,
) {
  const receiptData = await getReceiptData(receiptCode, user)

  return receiptData
}

export function HandleAddReceipts(receipt) {
  const itens = []
  const receipts = []
  let group = {
    name: '',
    receipts,
  }
  let joinedReceipts = {
    group,
    itens,
  }

  if (!receipts.some((r) => r.notafiscal === receipt.notafiscal)) {
    alert(`Nota escaneada`)

    const r = {
      loja: receipt.loja,
      serie: receipt.serie,
      fornecedor: receipt.fornecedor,
      emissao: receipt.emissao,
      notafiscal: receipt.notafiscal,
      razaosocial: receipt.razaosocial,
      tiponotafiscal: receipt.tiponotafiscal,
    }

    receipts.push(r)

    receipt.itens?.forEach((item) => {
      if (itens.some((i) => i.item === item.item)) {
        const index = itens.findIndex((i) => i.item === item.item)

        itens[index].quantidade += item.quantidade
      }

      if (!itens.some((i) => i.item === item.item)) {
        itens.push(item)
      }
    })

    group = {
      ...group,
      receipts,
    }

    joinedReceipts = {
      group,
      itens,
    }
  }

  if (receipts.includes(receipt)) {
    alert(`Essa nota já foi escaneada`)
  }

  return joinedReceipts
}

export function FindDuplicateReceipts(receipts) {
  const codeSet = new Set()

  receipts.forEach((item) => {
    if (codeSet.has(item.notafiscal)) {
      return true
    }

    codeSet.add(item.notafiscal)
  })

  return false
}

export function handleJoinInvoicesItems(
  invoices,
) {
  const invoiceItems = []

  invoices.forEach((invoice) => {
    invoice.itens?.forEach((item) => {
      invoiceItems.push(item)
    })
  })

  return invoiceItems
}
