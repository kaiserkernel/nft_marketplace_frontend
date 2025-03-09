import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.REACT_APP_PINATA_JWT}`,
  pinataGateway: `${process.env.REACT_APP_GATEWAY_URL}`
})