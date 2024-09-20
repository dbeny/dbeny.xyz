function updateNum(num) {
    return (num<10 ? "0" + num : num)
}

function getRemainingTime() {
    //realtime to new year
    const nextYear = new Date().getFullYear()+1
    const nextDate = new Date(`Jan 1, ${nextYear} 00:00:00`)

    const currentTime = new Date()
    const remainingTime = nextDate.getTime()-currentTime.getTime()

    const days = Math.floor(remainingTime/(1000*60*60*24))
    const hours = Math.floor((remainingTime%(1000*60*60*24))/(1000*60*60))
    const minutes = Math.floor((remainingTime%(1000*60*60))/(1000*60))
    const seconds = Math.floor((remainingTime%(1000*60))/1000)
    
    const d = document.getElementById("d")
    d.innerText = updateNum(days)
    const h = document.getElementById("h")
    h.innerText = updateNum(hours)
    const m = document.getElementById("m")
    m.innerText = updateNum(minutes)
    const s = document.getElementById("s")
    s.innerText = updateNum(seconds)

    //created-at
    const createdAt = new Date("Dec 15, 2023 09:29:00") 
    const createdAtDiff = currentTime.getTime()-createdAt.getTime()

    let dYears = Math.floor(createdAtDiff/(1000*60*60*24*365))
    const dDays = Math.floor(createdAtDiff/(1000*60*60*24))

    let diffStr = `${(dYears > 0 ? dYears+" éve és " : "")}${dDays} napja`

    const createdat = document.getElementById("created-at")
    createdat.innerText = diffStr
}

function initialize() {
    setInterval(() => {
        const remainingTimeMs = getRemainingTime()
        if (remainingTimeMs == 0) {
            console.log("jovan amugy is a fidesz nyer, koltozok csa")
            clearInterval()
        }
    }, 1000)
}

addEventListener("DOMContentLoaded", (event) => {
    initialize()
})