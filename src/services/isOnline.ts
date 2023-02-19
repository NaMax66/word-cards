export default function () {
    return Promise.race([
        fetch('https://github.githubassets.com/favicons/favicon.svg')
    ])
}
