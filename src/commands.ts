export const REGISTER_COMMAND = {
    name: 'register',
    description: '入学年度を登録します',
    type: 1,
    options: [
        {
            name: 'year',
            description: '入学年度',
            type: 4,
            required: true,
            min_value: 2013,
        },
    ],
}

export const HELP_COMMAND = {
    name: 'help',
    description: 'ヘルプを表示します',
    type: 1,
}

export const PING_COMMAND = {
    name: 'ping',
    description: 'Ping!',
    type: 1,
}
