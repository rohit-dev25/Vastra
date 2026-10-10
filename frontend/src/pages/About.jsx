import React from 'react'
import Title from "../components/Title";
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="About us"/>
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>
            Welcome to our platform, built to make ordering food simple, fast, and reliable.
            What started as a small idea has grown into a service focused on connecting people
            with the food they love, delivered right to their door.
          </p>
          <p>
            We are committed to quality, speed, and a smooth experience — from browsing the menu
            to the moment your order arrives. Every feature we build is guided by one goal: making
            your everyday food ordering effortless.
          </p>
          <b className='text-gray-800'>Our Mission</b>
          <p>
            Our mission is to deliver convenience without compromising on quality. We work closely
            with our partners to ensure every order is fresh, accurate, and on time.
          </p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>We carefully vet every partner to ensure consistent quality on every order.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Order anytime, anywhere, with a fast and intuitive experience.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Customer Service:</b>
          <p className='text-gray-600'>Our support team is always ready to help resolve any issue quickly.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About