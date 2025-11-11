import React, { useState, useEffect, useRef } from 'react'

const ReCaptcha = ({ sitekey, callback }) => {
    const recaptchaRef = useRef(null)
    const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false)

    const onRecaptchaLoad = () => {
        setIsRecaptchaLoaded(true)
    }

    useEffect(() => {
        window.onRecaptchaLoad = onRecaptchaLoad
        if (!window.grecaptcha) {
            const script = document.createElement('script')
            script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
            script.async = true
            script.defer = true
            document.head.appendChild(script)
        } else if (window.grecaptcha && window.grecaptcha.render) {
            setIsRecaptchaLoaded(true)
        }

        return () => {
            window.onRecaptchaLoad = null
        }
    }, [])

    useEffect(() => {
        if (isRecaptchaLoaded && recaptchaRef.current && !recaptchaRef.current.hasChildNodes()) {
            window.grecaptcha.render(recaptchaRef.current, {
                sitekey,
                callback,
            });
        }
    }, [isRecaptchaLoaded]);


    return (
        <div
            ref={recaptchaRef}
            style={{
                width: '30vw',
                height: '78px',
                margin: 'auto',
                transform: 'scale(1.1)',
                transformOrigin: '0 0',
                fontSize: '1px'
            }}
        ></div>

    )
}

export default ReCaptcha
