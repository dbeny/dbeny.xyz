function updateNum(num) {
    return (num<10 ? "0" + num : num)
}

function getRemainingTime() {
    const nextYear = new Date().getFullYear()+1
    const nextDate = new Date(`Jun 9, ${nextYear} 00:00:00`)
    const timeContainer = document.getElementById("time")

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
}

function initialize() {
    const interval = setInterval(() => {
        const remainingTimeMs = getRemainingTime()
        console.log(remainingTimeMs)
    }, 1000)
}

addEventListener("DOMContentLoaded", (event) => {
    initialize()
})