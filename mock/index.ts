import Mock from 'mockjs'

function dataList(num: number = 20) {
    return Mock.mock({
        [`list|${num}`]: [{
            'id': '@guid',
            title: '@ctitle(15,25)',
            img: '@natural(0,99999)',
            desc: '@ctitle(30,50)'
        }]
    })
}
export default [
    {
        url: "/api/list",
        method: "get",
        response: () => {
            return {
                code: 200,
                message: "ok",
                data: dataList(),
            }
        }
    }
]