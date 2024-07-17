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
