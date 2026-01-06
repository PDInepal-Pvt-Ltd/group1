import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

const LocationHours = () => {
  return (
    <section className="py-32 px-6 bg-charcoal-light">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Map / Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] lg:h-[500px] rounded-sm overflow-hidden"
          >
            <img
              src="https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Restaurant exterior at night"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Address Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-body text-lg text-foreground">
                    245 Fifth Avenue
                  </p>
                  <p className="font-body text-muted-foreground">
                    New York, NY 10016
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-body text-sm tracking-[0.3em] text-primary uppercase">
              Find Us
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-foreground mb-8">
              Location & Hours
            </h2>
            <div className="h-px w-16 bg-primary mb-10" />

            {/* Hours */}
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="font-display text-xl text-foreground">Hours</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-8 font-body text-muted-foreground">
                      <span>Monday – Thursday</span>
                      <span className="text-foreground">5:00 PM – 10:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-8 font-body text-muted-foreground">
                      <span>Friday – Saturday</span>
                      <span className="text-foreground">5:00 PM – 11:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-8 font-body text-muted-foreground">
                      <span>Sunday</span>
                      <span className="text-foreground">5:00 PM – 9:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href="tel:+12125550100"
                  className="font-body text-lg text-foreground hover:text-primary transition-colors"
                >
                  (212) 555-0100
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary" />
                <a
                  href="mailto:reservations@aurelia.com"
                  className="font-body text-lg text-foreground hover:text-primary transition-colors"
                >
                  reservations@aurelia.com
                </a>
              </div>
            </div>

            {/* Dress Code Note */}
            <div className="mt-12 p-6 bg-muted/20 rounded-sm border border-border">
              <p className="font-body text-muted-foreground italic">
                "Smart casual attire is requested. Jackets preferred but not required for gentlemen."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationHours;