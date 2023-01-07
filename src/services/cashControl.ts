import isEqual from 'lodash.isequal'

const PAIR = 'pair'
const UNSYNC_PAIR = 'unsync_pair'

type Prefix = typeof PAIR | typeof UNSYNC_PAIR

type Id = string | number

export function putToCash<T extends { id: Id }>(item: T, prefix: Prefix = PAIR) {
  localStorage.setItem(`${prefix}_${item.id}`, JSON.stringify(item))
}

export function getAllFromCash(prefix: Prefix = PAIR): any[] {
  const data: any[] = []

  Object.keys(localStorage).filter(el => el.startsWith(prefix)).forEach(el => {
    const result = localStorage.getItem(el)
    if(result) data.push(JSON.parse(result))
  })

  return data
}

export function removeElementByIdAndPrefix(id: string | number, prefix: Prefix) {
  localStorage.removeItem(`${prefix}_${id}`)
}

export function clearCash(prefix: Prefix = PAIR) {
  Object.keys(localStorage).filter(el => el.startsWith(prefix)).forEach(localStorage.removeItem)
}

export function syncCash<T extends { id: Id }>(data: T[], prefix: Prefix = PAIR) {
  const cash = getAllFromCash(prefix)

  data.forEach(el => {
    const cashIdx = cash.findIndex((item) => item.id === el.id)
    if(!isEqual(cash[cashIdx], el)) {
      putToCash(el, prefix)
      cash.splice(cashIdx, 1)
    }
  })

  cash.forEach(el => {
    localStorage.removeItem(`${prefix}_${el.id}`)
  })
}
