// 中间省略的函数
export const getShortenedLink = (link: string) => {
  if (link.length <= 40) {
    return link; // 如果链接短于等于20个字符，直接返回
  }
  const start = link.substring(0, 20); // 前10个字符
  const end = link.substring(link.length - 10); // 后10个字符
  return `${start}...${end}`; // 中间用省略号连接
};
