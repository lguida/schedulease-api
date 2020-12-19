function makePeopleArray() {
    return [
        {
            id: 1,
            email: "lguida@sas.upenn.edu",
            account: true,
            first_name: "Lucy",
            last_name: "Guida",
            username: "lguida",
            password: "lucypass1200",
        },
        {
            id: 2,
            account: false,
            email: "shomles@gmail.com",
            first_name: "Sherlock",
            last_name: "Holmes",
            username: "",
            password: "",
        },
        {
            id: 3,
            account: false,
            email: "mholmes@gmail.com",
            first_name: "Mycroft",
            last_name: "Holmes",
            username: "",
            password: "",
        },
        {
            id: 4,
            account: false,
            email: "glestrade@scotlandyard.com",
            first_name: "Greg",
            last_name: "Lestrade",
            username: "",
            password: "",
        }
    ]
}

module.exports = {
    makePeopleArray
}