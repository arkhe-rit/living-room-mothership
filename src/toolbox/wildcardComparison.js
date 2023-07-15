const wildcardComparison = (wildcardChannel, regularChannel) => {
    //format wildcard channel regex
    let expression = wildcardChannel.replace('*', '.+').replace('/', '\/');
    expression = `^${expression}$`;
    const regex = new RegExp(expression);
    return regex.test(regularChannel);
};

export { wildcardComparison }