import React, { useState, useEffect, useRef } from 'react'

const ReCaptcha = ({ sitekey, callback }) => {
    const recaptchaRef = useRef(null)
    const widgetIdRef = useRef(null)
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
        if (isRecaptchaLoaded && recaptchaRef.current && widgetIdRef.current === null) {
            try {
                widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
                    sitekey,
                    callback,
                });
                console.log('reCAPTCHA rendered successfully', widgetIdRef.current);
            } catch (error) {
                console.error('reCAPTCHA render error:', error);
            }
        }
    }, [isRecaptchaLoaded, sitekey, callback]);

    return (
        <div
            ref={recaptchaRef}
            style={{
                width: '304px',
                height: '78px',
                margin: 'auto',
            }}
        ></div>
    )
}

export default ReCaptcha