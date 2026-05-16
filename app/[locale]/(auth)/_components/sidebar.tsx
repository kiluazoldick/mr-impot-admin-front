"use client";

import { useTranslations } from "next-intl"
import Image from "next/image"
import { motion } from "framer-motion"

const Sidebar = () => {
    const t = useTranslations("Auth")

    return (
        <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-10 items-center justify-center w-full h-full bg-[#3EA7DE] text-white"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Image
                    src={"/logo.svg"}
                    alt={"Logo mr impot"}
                    width={275}
                    height={275}
                    className="bg-white rounded-xl"
                />
            </motion.div>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-3xl text-center font-bold mx-20"
            >
                {t("side_text")}
            </motion.p>
        </motion.div>
    )
}

export default Sidebar