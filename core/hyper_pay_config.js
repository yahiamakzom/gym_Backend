const getBarandEntityId = (brand) => {
    const env = process.env.NODE_ENV;
    if (env == "development") {
     return getBarandEntityIdDev(brand);
    } else if (env == "production") {
     return getBarandEntityIdProd(brand);
    } else {
     return Promise.reject(new Error("env is not valid"));
    }
}

const getBarandEntityIdDev = (brand) => {
    if (brand == "visa" || brand == "mastercard" || brand == "stcpay") {
     return "8ac7a4c789cce7da0189cef121f1010e";
    } else if (brand == "mada") {
     return "8ac7a4c789cce7da0189cef21f1b0112";
    } else if (brand == "applepay") {
     return "8ac7a4c88ac93f4f018acc6f1377032b";
    } else {
     return Promise.reject(new Error("brand is not valid"));
    }
}

const getBarandEntityIdProd = (brand) => {
    if (brand == "visa" || brand == "mastercard" || brand == "stcpay") {
     return "8ac9a4c88c152af8018c34bdd8db1eda";
    } else if (brand == "mada") {
     return "8ac9a4c88c152af8018c34be7f601ee3";
    } else if (brand == "applepay") {
     return "8ac7a4c88ac93f4f018acc6f1377032b";
    } else {
     return Promise.reject(new Error("brand is not valid"));
    }
}

module.exports = {
    getBarandEntityId
}